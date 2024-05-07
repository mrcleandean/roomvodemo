import { Dispatch, SetStateAction, createContext, useContext } from "react";
import { Room } from "../App";

export const RoomsContext = createContext<{
    rooms: Room[];
    setRooms: Dispatch<SetStateAction<Room[]>>;
    viewing: boolean;
    setViewing: Dispatch<SetStateAction<boolean>>;
    imgIndex: number;
    setImgIndex: Dispatch<SetStateAction<number>>;
    width: number;
    setWidth: Dispatch<SetStateAction<number>>;
    height: number;
    setHeight: Dispatch<SetStateAction<number>>;
    copied: boolean;
    setCopied: Dispatch<SetStateAction<boolean>>;
    noEnvIndex: number;
    setNoEnvIndex: Dispatch<SetStateAction<number>>;
} | undefined>(undefined);

const useRoomsContext = () => {
    const context = useContext(RoomsContext);
    if (context === undefined) {
        throw new Error('useContext must be used within a ContextProvider')
    }
    return context;
}

export default useRoomsContext;