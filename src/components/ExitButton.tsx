import { SignOut } from "@phosphor-icons/react";
import { FC } from "react";

const ExitButton: FC = () => {
    return (
        <button onClick={() => {
            const newWindow = window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ&ab_channel=RickAstley', '_blank', 'noopener,noreferrer');
            if (newWindow) newWindow.opener = null;
        }} className="relative h-[30px] md:h-[40px] rounded-[12px] py-[14px] px-[10px] md:py-[16px] md:px-[12px] overflow-hidden text-white hover:text-[#373C40] flex items-center gap-2 transition-all duration-200 font-inter font-medium">
            <SignOut size={16} className="z-[1] font-medium pointer-events-none" />
            <p className="z-[1] text-[7px] md:text-[12px] leading-[12px] md:leading-[20px] group-hover:hidden pointer-events-none">EXIT</p>
            <p className="z-[1] text-[7px] md:text-[12px] leading-[12px] md:leading-[20px] hidden group-hover:block pointer-events-none">DONT</p>
            <div className="z-0 absolute inset-0 opacity-35 hover:opacity-100 bg-black hover:bg-[#D1D4DE] transition-all duration-200" />
        </button>
    )
}

export default ExitButton;