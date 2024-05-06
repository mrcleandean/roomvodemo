import { CircleNotch, type Icon } from "@phosphor-icons/react";
import { cn } from "../lib/utils";
import { FC } from "react";
import { motion } from "framer-motion";
import { VIEW_SCALE } from "../constants";
import { type IconType } from "react-icons/lib";

export type CircularButtonProps = {
    icon: Icon | IconType;
    iconColor: string;
    onClick: () => void;
    className?: string;
    pending?: boolean;
}

const CircularButton: FC<CircularButtonProps> = ({ onClick, icon, iconColor, className = '', pending = false }) => {
    const Icon = icon;
    return (
        <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: VIEW_SCALE }}
            exit={{ scale: 0 }}
            onClick={onClick}
            className={cn("cursor-pointer overflow-hidden rounded-full flex justify-center items-center w-20 h-20", className)}
        >
            {pending ? (
                <CircleNotch
                    size={55}
                    color='#818C98'
                    className="animate-spin"
                />
            ) : (
                <Icon
                    size={50}
                    color={iconColor}
                    className="z-[1] pointer-events-none translate-y-0.5"
                />
            )}
            <div className="absolute opacity-45 hover:opacity-75 bg-black transition-all inset-0" />
        </motion.button>
    )
}

export default CircularButton;