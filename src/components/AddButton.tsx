import { CircleNotch, Plus } from "@phosphor-icons/react";

const AddButton = ({ pending, callback }: { pending: boolean, callback: () => void }) => {
    return (
        <div className='flex justify-center items-center w-full h-full origin-center scale-[.6] sm:scale-75 md:scale-100'>
            <button>
                {pending ? (
                    <CircleNotch
                        size={55}
                        color='#818C98'
                        className="animate-spin"
                    />
                ) : (
                    <Plus
                        size={55}
                        color='#818C98'
                        className="bg-transparent hover:bg-[#D1D4DE] cursor-pointer transition-all rounded-full opacity-35"
                        onClick={callback}
                    />
                )}
            </button>
        </div>
    )
}

export default AddButton;