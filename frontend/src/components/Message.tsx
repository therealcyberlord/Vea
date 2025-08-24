import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { cb } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ThinkingSection } from './ThinkingSection';
import type { Message } from "@/types/chat";

type ChatMessageProps = {
  message: Message;
  isAssistant: boolean;
  onImageClick: (src: string) => void;
};


export const ChatMessage = ({ message, isAssistant, onImageClick }: ChatMessageProps) => {

  // Parse thinking content and main content
  const parseMessageContent = (content: string) => {
    const thinkingRegex = /<think>([\s\S]*?)<\/think>/g;
    const thinkingMatches = [...content.matchAll(thinkingRegex)];
    
    let thinkingContent = '';
    let mainContent = content;
    
    if (thinkingMatches.length > 0) {
      thinkingContent = thinkingMatches.map(match => match[1]).join('\n\n').trim();
      mainContent = content.replace(thinkingRegex, '').trim();
    }
    
    return { thinkingContent, mainContent };
  };

  const { thinkingContent, mainContent } = parseMessageContent(message.content);

  const renderMarkdownContent = (content: string) => (
    <ReactMarkdown
      components={{
        code({ className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return match ? (
            <SyntaxHighlighter
              style={cb}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );

  return (
    <div className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-2xl select-none" aria-label="AI avatar">
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

        {/* Thinking Section */}
        {isAssistant && thinkingContent && (
          <ThinkingSection thinkingContent={thinkingContent} />
        )}

        {/* Main Content */}
        {mainContent && (
          <div className="text-sm font-normal text-gray-900">
          {isAssistant && message.type === 'markdown' ? (
            <div className="prose prose-blue prose-sm max-w-none">
              {renderMarkdownContent(mainContent)}
            </div>
          ) : (
            <span className="whitespace-pre-line">{mainContent}</span>
                      )}
          </div>
        )}
      </div>
    </div>
  );
};