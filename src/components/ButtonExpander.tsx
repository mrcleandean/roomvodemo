import { FC, useRef, useState } from "react";
import Button, { ButtonProps } from "./Button";
import { ArrowsOut } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

const ButtonExpander: FC<{ buttons: ButtonProps[] }> = ({ buttons }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = useState(false);
    useOnClickOutside(ref, () => {
        setExpanded(false);
    });
    const radius = 25;
    return (
        <motion.div ref={ref} className="relative w-full h-full mr-1">
            <Button
                layout={false}
                icon={ArrowsOut}
                onClick={() => setExpanded(prev => !prev)}
                className={expanded ? 'text-[#373C40]' : 'text-white'}
                bgClassName={expanded ? 'bg-[#D1D4DE] opacity-100' : 'bg-black'}
            />
            {buttons.map((buttonProp, i) => {
                const transformOrigin = `calc(100% + ${40 * 0.5}px + ${radius}px) 50%`;
                const translateX = `calc(-100% - ${radius}px)`;
                const rotate = 45 * i;
                return (
                    <AnimatePresence key={`${i}-${buttonProp.text}-expander`}>
                        {expanded && <motion.div
                            className="absolute top-0 origin-right"
                            style={{ transformOrigin, translateX }}
                            initial={{ opacity: 0, rotate: 0 }}
                            animate={{ opacity: 1, rotate }}
                            exit={{ opacity: 0, rotate: 0 }}
                        >
                            <Button
                                layout={false}
                                bgClassName="opacity-55"
                                {...buttonProp}
                            />
                        </motion.div>}
                    </AnimatePresence>
                )
            })}
        </motion.div>
    )
}

export default ButtonExpander;