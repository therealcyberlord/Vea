import { useState } from "react";
import { Search } from "react-feather";


export const SearchButton = () => {
    const [searchEnabled, setSearchEnabled] = useState(false);
    
    return (
        <button
            type="button"
            onClick={() => setSearchEnabled((v) => !v)}
            className={`p-2 rounded-xl transition-all duration-200 border-2 flex ${
                searchEnabled
                    ? 'bg-blue-100 border-blue-300 shadow-md'
                    : 'hover:bg-gray-100 text-gray-600 border-transparent'
            }`}
        >
            <Search size={20} />
        </button>
    );
}