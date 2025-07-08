import ReactMarkdown from 'react-markdown';
import type { Message } from "@/types/chat";

type ChatMessageProps = {
  message: Message;
  isAssistant: boolean;
  onImageClick: (src: string) => void;
};

export const ChatMessage = ({ message, isAssistant, onImageClick }: ChatMessageProps) => {
  return (
    <div className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-2xl select-none"
        aria-label="AI avatar"
      >
        {isAssistant ? '🤖' : '😀'}
      </div>
      <div className={`flex flex-col w-fit max-w-full leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl ${isAssistant ? '' : 'bg-blue-100 border-blue-200'}`}>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-semibold text-gray-900">{isAssistant ? 'Vea AI' : 'You'}</span>
          <span className="text-sm font-normal text-gray-500">
            {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
          </span>
        </div>

        {message.image && (
          <img
            src={message.image}
            alt="uploaded"
            className="my-2 rounded-lg border border-gray-200 cursor-pointer transition hover:brightness-90 object-contain max-w-full"
            style={{ height: 'auto', maxHeight: '24rem', width: 'auto', maxWidth: '100%' }}
            onClick={() => onImageClick(message.image || '')}
          />
        )}

        <div className="text-sm font-normal py-2.5 text-gray-900">
          {isAssistant && message.type === 'markdown' ? (
            <div className="prose prose-blue prose-sm max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          ) : (
            <span className="whitespace-pre-line">{message.content}</span>
          )}
        </div>
      </div>
    </div>
  );
};
