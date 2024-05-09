import { motion } from "framer-motion";
import { type FC } from "react";
import Button, { type ButtonProps } from "./Button";

const ButtonStrip: FC<{ buttons: ButtonProps[] }> = ({ buttons }) => {
    return (
        <motion.div className="flex gap-2" layout layoutRoot>
            {/* LayoutRoot prevents button jumping */}
            {buttons.map((buttonProp, i) => (
                <Button
                    key={i}
                    {...buttonProp}
                />
            ))}
        </motion.div>
    )
}

export default ButtonStrip;