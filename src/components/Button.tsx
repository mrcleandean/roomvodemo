import { Icon } from "@phosphor-icons/react";
import { FC } from "react";

type ButtonProps = {
    onClick: () => void;
    text: string;
    Symbol?: Icon;
}

const Button: FC<ButtonProps> = ({ onClick, text, Symbol = null }) => {
    return (
        <button onClick={onClick} className="relative h-[30px] md:h-[40px] rounded-[12px] py-[14px] px-[10px] md:py-[16px] md:px-[12px] overflow-hidden text-white hover:text-[#373C40] flex items-center gap-0.5 md:gap-2 transition-all duration-200 font-inter font-medium">
            {Symbol && (
                <Symbol size={16} className="z-[1] font-medium pointer-events-none" />
            )}
            <p className="z-[1] text-[7px] md:text-[12px] leading-[12px] md:leading-[20px] pointer-events-none">{text}</p>
            <div className="z-0 absolute inset-0 opacity-35 hover:opacity-100 bg-black hover:bg-[#D1D4DE] transition-all duration-200" />
        </button>
    )
}



export default Button;