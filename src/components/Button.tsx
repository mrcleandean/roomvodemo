import { type Icon } from "@phosphor-icons/react";
import { type FC } from "react";
import { cn } from "../lib/utils";
import { motion } from 'framer-motion';
import { SPRING_OPTIONS } from "@/constants";

export type ButtonProps = {
  icon?: Icon;
  text: string;
  onClick: () => void;
  className?: string;
}

const Button: FC<ButtonProps> = ({ icon, text, onClick, className = '' }) => {
  const Icon = icon;
  return (
    <motion.button
      layout
      onClick={onClick}
      className={cn("relative h-[40px] rounded-[12px] py-[16px] px-[12px] overflow-hidden text-white hover:text-[#373C40] flex items-center gap-2 transition-all duration-200 font-inter font-medium", className)}
    >
      {Icon && (
        <Icon
          size={16} className="z-[1] font-medium pointer-events-none"
        />
      )}
      <p className="z-[1] text-[12px] leading-[20px] pointer-events-none">{text}</p>
      <div className="z-0 absolute inset-0 opacity-35 hover:opacity-100 bg-black hover:bg-[#D1D4DE] transition-all duration-200" />
    </motion.button>
  )
}

export default Button;