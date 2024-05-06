import Button, { type ButtonProps } from "./Button"
import { type FC } from "react"
import { motion } from "framer-motion"
import { SPRING_OPTIONS } from "../constants"

const ButtonPanel: FC<{ buttons: ButtonProps[] }> = ({ buttons }) => {
    return (
        <div className="w-full flex justify-center absolute z-[2] scale-[.95] md:scale-100 origin-top">
            <motion.div
                layout
                transition={{ type: 'spring', stiffness: 300, damping: 27, }}
                className="relative rounded-b-[16px] p-[8px] overflow-hidden"
            >
                <motion.div
                    layout="position"
                    transition={SPRING_OPTIONS}
                    className="relative z-[1] flex justify-center gap-2"
                >
                    {buttons.map((buttonProp, i) => {
                        return (
                            <Button
                                key={i}
                                {...buttonProp}
                            />
                        )
                    })}
                </motion.div>
                <div className="absolute inset-0 z-0 opacity bg-[#303438] opacity-55" />
            </motion.div>
        </div >
    )
}

export default ButtonPanel;