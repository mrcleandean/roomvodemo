import { FC, useEffect, useState } from "react";
import { Room } from "../App";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { ADD_MEDIA_Q, IMAGE_JUMP, MAX_BLUR, SPRING_OPTIONS, VIEW_RADIUS, VIEW_SCALE } from "../constants";
import CircularButton from "./CircularButton";
import { Copy, Heart, ShareNetwork, X } from "@phosphor-icons/react";
import Descriptors from "./Descriptors";
import { v4 as uuid } from 'uuid';
import { FaHeart } from 'react-icons/fa';
import useRoomsContext from "../hooks/useRoomsContext";
import clamp from "lodash.clamp";
import ButtonExpander from "./ButtonExpander";
import ButtonStrip from "./ButtonStrip";
import AddButton from "./AddButton";

export type ViewProps = {
    room: Room;
    i: number;
}

const View: FC<ViewProps> = ({ room, i }) => {
    const { rooms, setRooms, imgIndex, setImgIndex, viewing, width, height, copied, setCopied } = useRoomsContext();
    const [deleted, setDeleted] = useState(false); // triggers delete animation if set to true
    const offsetControls = useAnimationControls();
    const backdropControls = useAnimationControls();
    const iOffset = i - imgIndex; // The index relative to the one being viewed
    const marginX = width * (1 - VIEW_SCALE) * 0.5; // The amount of space on the sides of the image when in view mode
    const marginY = height * (1 - VIEW_SCALE) * 0.5; // The amount of space on the top and bottom of the image when in view mode
    const viewingX = iOffset * (width - marginX * 1.5); // The x val for view mode
    const regularX = iOffset * width; // The x val for regular mode

    useEffect(() => {
        if (Math.abs(iOffset) > 2) return // performance optimization to avoid animating offscreen images
        offsetControls.start(({ // animates the x value
            x: viewingX,
            scale: viewing ? [1, IMAGE_JUMP, 1] : 1
        }));
        backdropControls.start({ // animates the backdrop filter opacity to dislay a blur effect
            opacity: [0, 1, 0]
        });
    }, [rooms.length, imgIndex]); // runs when adding, deleting, or dragging to next/prev

    useEffect(() => {
        if (Math.abs(iOffset) > 2) return
        offsetControls.start(({
            x: viewing ? viewingX : regularX,
        }))
    }, [viewing, width]); // runs when resizing or toggling view mode

    if (Math.abs(iOffset) > 2) return null; // peroformance optimization to avoid rendering offscreen images

    return (
        <AnimatePresence
            onExitComplete={() => {
                setImgIndex(prev => clamp(prev - 1, 0, rooms.length - 1));
                setRooms((prev) => prev.filter(r => r.id !== room.id));
            }} // runs after delete animation is completed
        >
            {!deleted && (
                <motion.div
                    // To prevent buttons from losing clickability when scale margins overlap, height must also be explicitly set to respond to mobile address bar
                    style={{ zIndex: iOffset === 0 ? 1 : 0, height }}
                    initial={{ x: viewing ? viewingX : regularX }}
                    animate={offsetControls}
                    className="fixed w-screen object-cover translate-y-full origin-left will-change-transform"
                    transition={SPRING_OPTIONS}
                >
                    <motion.div
                        style={{ backgroundImage: `url(${room.src})` }}
                        className="w-full h-full relative shadow-md md:shadow-xl shadow-gray-700 bg-cover bg-center flex justify-between"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: viewing ? VIEW_SCALE : 1, borderRadius: !viewing ? '0px' : VIEW_RADIUS, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={SPRING_OPTIONS}
                    >
                        <motion.div
                            // We're animating the opacity of a blurred backdrop to optimize performance instead of animating filter directly on the parent
                            className="absolute inset-0"
                            animate={backdropControls}
                            transition={SPRING_OPTIONS}
                            style={{ backdropFilter: `blur(${MAX_BLUR}px)`, borderRadius: VIEW_RADIUS }}
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
                            style={{ scale: 1 / VIEW_SCALE, height: marginY, width: width * VIEW_SCALE, translateY: marginY }}
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
                            <motion.div
                                className="absolute right-0 top-1/2 -translate-y-1/2 flex justify-center items-center"
                                style={{ width: marginX, translateX: width <= ADD_MEDIA_Q ? -marginX * 0.5 : 0 }}
                            >
                                <AddButton className="absolute" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default View;