const Descriptors = ({ title, floor, wall }: { title: string, floor: string, wall: string }) => {
    return (
        <div className="flex flex-row md:flex-col gap-1.5 md:gap-0">
            <h3 className='text-[9px] leading-[10px] md:text-[12px] md:leading-[20px] font-bold tracking-[0.5px]'>{title}</h3>
            <div className='flex gap-[7px] md:gap-[35px]'>
                <p className='font-medium text-[9px] leading-[12px] md:text-[12px] md:leading-[20px] tracking-[0.5px]'>{floor}</p>
                <p className='font-medium text-[9px] leading-[12px] md:text-[12px] md:leading-[20px] tracking-[0.5px]'>{wall}</p>
            </div>
        </div>
    )
}

export default Descriptors;