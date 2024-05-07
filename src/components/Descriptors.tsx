import { FC } from "react";

export type DescriptorsProps = {
    title: string;
    floor: string;
    wall: string;
}

const Descriptors: FC<DescriptorsProps> = ({ title, floor, wall }) => {
    return (
        <div
            className="flex flex-col">
            <h3 className='text-[12px] leading-[20px] font-bold tracking-[0.5px]'>{title}</h3>
            <div className='flex flex-col gap-0 sm:flex-row sm:gap-[35px]'>
                <p className='font-medium text-[12px] leading-[15px] sm:leading-[20px] tracking-[0.5px]'>{floor}</p>
                <p className='font-medium text-[12px] leading-[15px] sm:leading-[20px] tracking-[0.5px]'>{wall}</p>
            </div>
        </div>
    )
}

export default Descriptors;