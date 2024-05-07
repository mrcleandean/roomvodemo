import { useState } from "react";
import axios, { AxiosError } from "axios";
import useRoomsContext from "@/hooks/useRoomsContext";
import { useDebouncedCallback } from 'use-debounce';
import { Room } from "@/App";
import { pages } from "@/constants";
import CircularButton from "./CircularButton";
import { Plus } from "@phosphor-icons/react";
import { v4 as uuid } from 'uuid';
import clamp from "lodash.clamp";

export type RandomImage = {
    description: string;
    user: {
        username: string;
        name: string;
    };
    location: {
        country: string;
    };
    urls: {
        full: string;
    };
};

const AddButton = () => {
    const { rooms, setRooms, setImgIndex, noEnvIndex, setNoEnvIndex } = useRoomsContext();
    const [pending, setPending] = useState(false);

    const getImage = useDebouncedCallback(async () => {
        if (pending) return;
        const loader = new Image();
        try {
            setPending(true);
            const { data: img } = (await axios.get(
                `https://api.unsplash.com/photos/random/?client_id=${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`,
            )) as { data: RandomImage };
            const newRoom: Room = {
                id: uuid(),
                src: img.urls.full,
                title: img.user.username || "No Username",
                floor: img.location.country || "No Location",
                wall: img.user.name || "No Name",
                favourited: false,
            };

            loader.onload = () => {
                setImgIndex(prev => clamp(prev + 1, 0, rooms.length));
                setRooms(prev => [...prev, newRoom]);
            };
            loader.src = newRoom.src;
        } catch (error) {
            loader.onload = () => {
                setImgIndex(prev => clamp(prev + 1, 0, rooms.length));
                setRooms(prev => [...prev, { ...pages[noEnvIndex % pages.length], id: uuid() }]);
            };
            loader.src = pages[noEnvIndex % pages.length].src; // filler image if no .env is supplied
            if (error instanceof AxiosError && error?.message) {
                console.log('Error likely due to invalid Unsplash env variable - ', error.message);
            } else {
                console.log(error);
            }
        } finally {
            setNoEnvIndex(prev => prev + 1);
            setPending(false);
        }
    }, 300);

    return (
        <CircularButton
            icon={Plus}
            iconColor="white"
            onClick={getImage}
            pending={pending}
            className="absolute"
        />
    )
}

export default AddButton;
