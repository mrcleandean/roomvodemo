import { useEffect, useState } from "react";
import { Room } from "../App";
import { pages } from "../constants";
import { RoomsContext } from "../hooks/useRoomsContext";
import { COPY_TIMEOUT } from "../constants";

const RoomsContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [rooms, setRooms] = useState<Room[]>(pages); // Set this to user data in an acutal application
    const [viewing, setViewing] = useState<boolean>(false); // Toggles view mode (triggers animations)
    const [imgIndex, setImgIndex] = useState<number>(0); // Automatically animates to the next/prev image when changed
    const [width, setWidth] = useState<number>(window.innerWidth); // Updated when parent ref in app changes dimensions
    const [height, setHeight] = useState<number>(window.innerHeight);  // Updated when parent ref in app changes dimensions
    const [copied, setCopied] = useState<boolean>(false); // Triggers a copy to clipboard when true
    const [noEnvIndex, setNoEnvIndex] = useState<number>(0); // For demo purposes if no .env file is provided
    useEffect(() => {
        if (!copied) return; // prevents errors on inital render and prevents reruns on timeout
        if (rooms[imgIndex]) { // prevents errors if rooms.length === 0
            navigator.clipboard.writeText(rooms[imgIndex].src); // Copies the local source if its a preloaded demo image
        }
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