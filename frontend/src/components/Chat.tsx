import type { ChatHistory } from "@/types/chat";
import ReactMarkdown from 'react-markdown'
import React from "react";
import { UploadButton } from "@/components/UploadButton";
import { X } from "react-feather";
import { SubmitButton } from "@/components/SubmitButton";
import { NavBar } from "@/components/NavBar";
import { useChatState } from "@/hooks/useChatState";
import { useFileReader } from "@/hooks/useFileReader";


type ChatProps = {
    conversations: ChatHistory;
    onSend: (payload: { text: string; image: string | null }) => void;
}

export const Chat = ({ conversations, onSend }: ChatProps) => {
    const { state, actions } = useChatState();
    const { readFile } = useFileReader();

    const handleFileSelect = (file: File) => {
        readFile(file).then((result: string) => {
            actions.setInputImagePreview(result);
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        actions.setInput(e.target.value);
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!state.input.trim() && !state.inputImagePreview) return;
        const currentInput = state.input;
        const currentImage = state.inputImagePreview;
        actions.setInput("");
        actions.setInputImagePreview(null);
        actions.setIsTyping(true);
        await onSend({ text: currentInput, image: currentImage });
        actions.setIsTyping(false);
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            if (item.type.startsWith('image/')) {
                const file = item.getAsFile();
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        actions.setInputImagePreview(event.target?.result as string);
                    };
                    reader.readAsDataURL(file);
                }
            
                e.preventDefault();
                break;
            }
        }
    };

    return (
        <>
        {state.chatImagePreview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => actions.setChatImagePreview(null)}>
                <img
                    src={state.chatImagePreview}
                    alt="preview-large"
                    className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl border-4 border-white"
                    onClick={e => e.stopPropagation()}
                />
                <button
                    className="absolute top-6 right-8 text-white text-3xl font-bold bg-black/40 rounded-full px-3 py-1 hover:bg-black/70 transition"
                    onClick={() => actions.setChatImagePreview(null)}
                    aria-label="Close preview"
                >
                    ×
                </button>
            </div>
        )}
        <div className="fixed inset-0 bg-gray-100 flex flex-col items-center justify-center w-full h-full min-h-0 min-w-0">
            <div className="w-full h-full max-w-none flex flex-col">
                <div className="flex flex-col w-full h-full bg-white rounded-none shadow-none border-0 overflow-hidden">
                    <NavBar />
                    <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
                        {conversations.messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <h3 className="text-xl font-medium text-gray-700 mb-2"> Welcome 👋 </h3>
                                <p className="text-gray-500 max-w-md">
                                    Ask a question or start a conversation with Vea AI. You can also upload images for analysis or discussion.
                                </p>
                            </div>
                        ) : (
                            <>
                            {conversations.messages.map((message, index) => {
                                const isAssistant = message.sender === 'assistant';
                                return (
                                    <div
                                        key={index}
                                        className={`flex items-start gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'}`}
                                    >
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-2xl select-none"
                                            aria-label="AI avatar"
                                        >
                                            {isAssistant ? '🤖' : '😀'}
                                        </div>
                                        <div className={`flex flex-col w-fit max-w-3xl leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl ${isAssistant ? '' : 'bg-blue-100 border-blue-200'}`}>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm font-semibold text-gray-900">{isAssistant ? 'Vea AI' : 'You'}</span>
                                                <span className="text-sm font-normal text-gray-500">{message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                            </div>
                                            {/* Support image in message */}
                                            {message.image && (
                                                <img
                                                    src={message.image}
                                                    alt="uploaded"
                                                    className="my-2 rounded-lg border border-gray-200 cursor-pointer transition hover:brightness-90 object-contain max-w-full"
                                                    style={{ height: 'auto', maxHeight: '24rem', width: 'auto', maxWidth: '100%' }}
                                                    onClick={() => actions.setChatImagePreview(message.image || null)}
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
                            })}
                            {state.isTyping && (
                                <div className="flex items-start gap-2.5">
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-2xl select-none" aria-label="AI avatar">
                                        🤖
                                    </div>
                                    <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-sm font-semibold text-gray-900">Vea AI</span>
                                            <span className="text-sm font-normal text-gray-500">
                                                typing…
                                            </span>
                                        </div>
                                        <div className="flex gap-1 mt-2 animate-pulse">
                                            <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="block w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            </>
                        )}
                    </div>
                    <div className="w-full flex flex-col gap-2 mt-4 pb-4 px-4">
                        <form className="flex gap-2 items-end w-full" onSubmit={handleSend}>
                            <div className="flex-1 flex flex-col gap-2">
                                {state.inputImagePreview && (
                                    <div className="mb-2 flex items-center gap-2 relative w-fit">
                                        <img src={state.inputImagePreview} alt="preview" className="max-h-32 rounded-lg border border-gray-200" />
                                        <button
                                            type="button"
                                            className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-red-100 text-red-500 shadow"
                                            onClick={() => actions.setInputImagePreview(null)}
                                            aria-label="Remove image preview"
                                            style={{ lineHeight: 0 }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                )}
                                <div className="flex items-end gap-2 w-full">
                                    <textarea
                                        className="resize-none flex-1 min-h-[44px] max-h-40 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm transition-all text-base placeholder-gray-400"
                                        style={{overflow: 'hidden'}}
                                        placeholder="Ask me anything..."
                                        value={state.input}
                                        onChange={handleInputChange}
                                        rows={1}
                                        onInput={e => {
                                            const target = e.target as HTMLTextAreaElement;
                                            target.style.height = 'auto';
                                            target.style.height = target.scrollHeight + 'px';
                                        }}
                                        onPaste={handlePaste}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                if (state.input.trim() || state.inputImagePreview) {
                                                    handleSend(e);
                                                }
                                            }
                                        }}
                                    />
                                    <div className="flex gap-1 items-center">
                                        {/* <SearchButton /> */}
                                        <UploadButton onFileSelect={handleFileSelect} />
                                    </div>
                                    <SubmitButton disabled={!state.input.trim() && !state.inputImagePreview} />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};