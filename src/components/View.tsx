import { FC, useEffect, useState } from "react";
import { Room } from "../App";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { MAX_BLUR, SPRING_OPTIONS, VIEW_SCALE } from "../constants";
import CircularButton from "./CircularButton";
import { Copy, Heart, ShareNetwork, X } from "@phosphor-icons/react";
import Descriptors from "./Descriptors";
import { v4 as uuid } from 'uuid';
import { FaHeart } from 'react-icons/fa';
import useRoomsContext from "../hooks/useRoomsContext";
import clamp from "lodash.clamp";
import ButtonExpander from "./ButtonExpander";
import ButtonStrip from "./ButtonStrip";
import { Plus } from "@phosphor-icons/react";

export type ViewProps = {
    room: Room;
    i: number;
}

const View: FC<ViewProps> = ({ room, i }) => {
    const { rooms, setRooms, imgIndex, setImgIndex, viewing, width, height, copied, setCopied } = useRoomsContext();
    const [deleted, setDeleted] = useState(false);
    const offsetControls = useAnimationControls();
    const backdropControls = useAnimationControls();
    const iOffset = i - imgIndex;
    const viewingX = (iOffset * width) * (1 - (1 - VIEW_SCALE) * 0.75);
    const regularX = iOffset * width;

    useEffect(() => {
        if (Math.abs(iOffset) > 2) return
        offsetControls.start(({
            x: viewingX,
            scale: viewing ? [1, 1.015, 1] : 1
        }));
        backdropControls.start({
            opacity: [0, 1, 0]
        });
    }, [rooms.length, imgIndex]);

    useEffect(() => {
        if (Math.abs(iOffset) > 2) return
        offsetControls.start(({
            x: viewing ? viewingX : regularX,
        }))
    }, [viewing, width]);

    if (Math.abs(iOffset) > 2) return null;

    return (
        <AnimatePresence
            onExitComplete={() => {
                setImgIndex(prev => clamp(prev - 1, 0, rooms.length - 1));
                setRooms((prev) => prev.filter(r => r.id !== room.id));
            }}
        >
            {!deleted && (
                <motion.div
                    style={{ zIndex: iOffset === 0 ? 1 : 0 }} // To prevent buttons from losing clickability when scale margins overlap
                    initial={{ x: viewing ? viewingX : regularX }}
                    animate={offsetControls}
                    className="absolute h-screen w-screen object-cover translate-y-full origin-left will-change-transform"
                    transition={SPRING_OPTIONS}
                >
                    <motion.div
                        style={{ backgroundImage: `url(${room.src})` }}
                        className="w-full h-full relative shadow-md md:shadow-xl shadow-gray-700 bg-cover bg-center flex justify-between"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: viewing ? VIEW_SCALE : 1, borderRadius: !viewing ? '0px' : '20px', opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={SPRING_OPTIONS}
                    >
                        <motion.div
                            // We're animating the opacity of a blurred backdrop to optimize performance instead of animating filter directly on the parent
                            className="absolute inset-0"
                            animate={backdropControls}
                            transition={SPRING_OPTIONS}
                            style={{ backdropFilter: `blur(${MAX_BLUR}px)`, borderRadius: '20px' }}
                        />
                        <AnimatePresence>
                            {viewing && room.favourited && (
                                <CircularButton
                                    icon={FaHeart}
                                    iconColor={'pink'}
                                    onClick={() => setRooms(prev => [...prev.slice(0, i), { ...room, favourited: !room.favourited }, ...prev.slice(i + 1)])}
                                    className="absolute left-3 top-3"
                                />
                            )}
                        </AnimatePresence>
                        <AnimatePresence>
                            {viewing && (
                                <CircularButton
                                    icon={X}
                                    iconColor="white"
                                    onClick={() => setDeleted(true)}
                                    className="absolute right-3 top-3"
                                />
                            )}
                        </AnimatePresence>
                        <motion.div
                            // We're undoing the scale here since we want the buttons to be full size and the parent is scaled down
                            style={{ scale: 1 / VIEW_SCALE, height: height * (1 - VIEW_SCALE) * 0.5, width: width * VIEW_SCALE, translateY: height * (1 - VIEW_SCALE) * 0.5 }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: viewing && imgIndex === i ? 1 : 0 }}
                            exit={{ opacity: 0 }}
                            transition={SPRING_OPTIONS}
                            className="flex justify-between items-center absolute bottom-0 origin-top-left"
                        >
                            <Descriptors
                                title={room.title}
                                wall={room.wall}
                                floor={room.floor}
                            />
                            <div className="block md:hidden">
                                <ButtonExpander buttons={[
                                    { icon: ShareNetwork, text: `${copied ? 'COPIED' : 'SHARE'}`, onClick: () => setCopied(true) },
                                    { icon: Heart, text: 'FAVOURITE', onClick: () => setRooms(prev => [...prev.slice(0, i), { ...room, favourited: !room.favourited }, ...prev.slice(i + 1)]) },
                                    { icon: Copy, text: 'DUPLICATE', onClick: () => { setRooms(prev => [...prev.slice(0, i + 1), { ...room, id: uuid() }, ...prev.slice(i + 1)]); setImgIndex(prev => prev + 1); } },
                                ]} />
                            </div>
                            <div className="hidden md:block">
                                <ButtonStrip
                                    buttons={[
                                        { onClick: () => setCopied(true), text: `${copied ? 'COPIED' : 'SHARE'}`, icon: ShareNetwork, },
                                        { onClick: () => setRooms(prev => [...prev.slice(0, i), { ...room, favourited: !room.favourited }, ...prev.slice(i + 1)]), text: "FAVOURITE", icon: Heart },
                                        {
                                            onClick: () => {
                                                setRooms(prev => [...prev.slice(0, i + 1), { ...room, id: uuid() }, ...prev.slice(i + 1)])
                                                setImgIndex(prev => prev + 1);
                                            },
                                            text: "DUPLICATE",
                                            icon: Copy
                                        }
                                    ]}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                    <AnimatePresence>
                        {i === rooms.length - 1 && viewing && (
                            <div
                                className="absolute right-0 top-0 bottom-0 flex justify-center items-center"
                                style={{ width: width * (1 - VIEW_SCALE) * 0.5 }}
                            >
                                <CircularButton
                                    icon={Plus}
                                    iconColor="white"
                                    onClick={() => console.log('test')}
                                />
                            </div>
                        )}
                    </AnimatePresence>
                </motion.div >
            )}
        </AnimatePresence >
    )
}


export default View;