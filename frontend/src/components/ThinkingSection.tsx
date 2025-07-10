import { useState } from "react";
import { ChevronDown, ChevronRight, Activity } from 'react-feather';

export const ThinkingSection = ({ thinkingContent }: { thinkingContent: string }) => {
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  return (
    <div className="mt-4 mb-4 border border-gray-200 rounded-lg overflow-hidden bg-white/50 backdrop-blur-sm">
      <button
        onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
        className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-gray-50/80 transition-colors duration-200 group"
      >
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
            Thinking process
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-500 hidden sm:block cursor-pointer">
            {isThinkingExpanded ? 'Hide' : 'Show'}
          </span>
          {isThinkingExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500 transition-transform duration-200" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500 transition-transform duration-200" />
          )}
        </div>
      </button>
      
      <div className={`transition-all duration-300 ease-in-out ${isThinkingExpanded ? 'max-h-none opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
        <div className="border-t border-gray-100">
          <div className="p-1 m-2 rounded-md">
            <div className="prose prose-blue prose-sm max-w-none text-gray-700 font-sans leading-relaxed">
              {thinkingContent}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};