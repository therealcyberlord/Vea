import type { ChatHistory } from "@/types/chat";
import React from "react";
import { UploadButton } from "@/components/UploadButton";
import { SubmitButton } from "@/components/SubmitButton";
import { NavBar } from "@/components/NavBar";
import { useChatState } from "@/hooks/useChatState";
import { useFileReader } from "@/hooks/useFileReader";
import { usePasteImage } from "@/hooks/usePaste";
import { ChatMessage } from "@/components/Message";
import { ImagePreview } from "@/components/QueryImagePreview";
import { ImageModalPreview } from "@/components/ImageModalPreview";
import { BubbleAnimation } from "./BubbleAnimation";

type ChatProps = {
  conversations: ChatHistory;
  onSend: (payload: { text: string; image: string | null }) => void;
};

export const Chat = ({ conversations, onSend }: ChatProps) => {
  const { state, actions } = useChatState();
  const { readFile } = useFileReader();
  const handlePasteImage = usePasteImage((dataUrl: string) => {
    actions.setInputImagePreview(dataUrl);
  });

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
    actions.clearInputAndStartTyping();
    await onSend({ text: currentInput, image: currentImage });
    actions.setIsTyping(false);
  };

  

  return (
    <>
      {state.chatImagePreview && (
        <ImageModalPreview
          src={state.chatImagePreview}
          onClose={() => actions.setChatImagePreview(null)}
        />
      )}
      <div className="fixed inset-0 bg-gray-100 flex flex-col items-center justify-center w-full h-full min-h-0 min-w-0">
        <div className="w-full h-full max-w-none flex flex-col">
          <div className="flex flex-col w-full h-full bg-white rounded-none shadow-none border-0 overflow-hidden">
            <NavBar />
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 bg-gradient-to-b from-gray-50 to-white">
              {conversations.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <h3 className="text-xl font-medium text-gray-700 mb-2">Welcome 👋</h3>
                  <p className="text-gray-500 max-w-md">
                    Ask a question or start a conversation with Vea AI. You can also upload images for analysis or
                    discussion.
                  </p>
                </div>
              ) : (
                <>
                  {conversations.messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      isAssistant={message.sender === "assistant"}
                      onImageClick={(src) => actions.setChatImagePreview(src)}
                    />
                  ))}
                  {state.isTyping && (
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-100 text-2xl select-none"
                        aria-label="AI avatar"
                      >
                        🤖
                      </div>
                      <div className="flex flex-col w-full max-w-[320px] leading-1.5 p-4 border-gray-200 bg-gray-100 rounded-e-xl rounded-es-xl">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">Vea AI</span>
                          <span className="text-sm font-normal text-gray-500">typing…</span>
                        </div>
                        <BubbleAnimation />
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
                  <ImagePreview
                    src={state.inputImagePreview}
                    onRemove={() => actions.setInputImagePreview(null)}
                  />
                )}

                <div className="flex items-end gap-2 w-full">
                  <textarea
                      className="resize-none flex-1 min-h-[44px] max-h-40 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white shadow-sm transition-all text-base placeholder-gray-400"
                      style={{ overflow: "hidden" }}
                      placeholder="Ask me anything..."
                      value={state.input}
                      onChange={handleInputChange}
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        target.style.height = "auto";
                        target.style.height = target.scrollHeight + "px";
                      }}
                      onPaste={handlePasteImage}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          if (state.input.trim() || state.inputImagePreview) {
                            handleSend(e);
                          }
                        }
                      }}
                    />
                    <div className="flex gap-1 items-center">
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
