import { useEffect, useState } from "react";
import { Room } from "../App";
import { pages } from "../constants";
import { RoomsContext } from "../hooks/useRoomsContext";
import { COPY_TIMEOUT } from "../constants";

const RoomsContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [rooms, setRooms] = useState<Room[]>(pages);
    const [viewing, setViewing] = useState<boolean>(false);
    const [imgIndex, setImgIndex] = useState<number>(0);
    const [width, setWidth] = useState<number>(window.innerWidth);
    const [height, setHeight] = useState<number>(window.innerHeight);
    const [copied, setCopied] = useState<boolean>(false);
    const [noEnvIndex, setNoEnvIndex] = useState<number>(0);
    useEffect(() => {
        if (!copied) return; // prevents errors on inital render and prevents reruns on timeout
        navigator.clipboard.writeText(rooms[imgIndex].src);
        const timeoutId = setTimeout(() => {
            setCopied(false);
        }, COPY_TIMEOUT);
        return () => clearTimeout(timeoutId);
    }, [copied]);
    return (
        <RoomsContext.Provider value={{
            rooms, setRooms, viewing, setViewing, imgIndex,
            setImgIndex, width, setWidth, height, setHeight,
            copied, setCopied, noEnvIndex, setNoEnvIndex
        }}>
            {children}
        </RoomsContext.Provider>
    )
}

export default RoomsContextProvider