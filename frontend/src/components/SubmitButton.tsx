import { ArrowUp } from "react-feather";

type EnterButtonProps = {
    disabled: boolean;
};

export const SubmitButton = ({disabled}: EnterButtonProps) => {
    return (
        <button 
            type="submit"
            disabled={disabled}
            className="p-2 rounded-xl border-2 border-transparent flex items-center justify-center text-gray-600 hover:bg-gray-100 focus:outline-none transition-all duration-200 cursor-pointer"
        >
            <ArrowUp size={20} />
        </button>
    )
}