import { useState } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Chat } from "@/components/Chat";
import type { ChatMessage, ChatHistory } from "@/types/chat";
import { callVeaAgent } from "@/api/chat";

const initialHistory: ChatHistory = {
  messages: [],
};

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatHistory>(initialHistory);

  // Handles sending a new message (now supports text and image)
  const handleSend = async (payload: { text: string; image: string | null }) => {
    if (!payload.text.trim() && !payload.image) return;
    const userMsg: ChatMessage = {
      id: uuidv4(),
      sender: "user",
      content: payload.text,
      type: "text",
      timestamp: new Date(),
      image: payload.image || null,
    };
    setConversations((prev) => ({
      messages: [...prev.messages, userMsg],
    }));

    try {
      console.log("image", payload.image);
      const agentInput = {
        query: payload.text,
        imageData: payload.image ? payload.image : "",
        webSearchEnabled: false, 
      }
      const res = await callVeaAgent(agentInput);
      console.log("Agent response:", res);

      const content = res || "Sorry, I couldn't generate a response.";
      const assistantMsg: ChatMessage = {
        id: uuidv4(),
        sender: "assistant",
        content,
        type: "markdown",
        timestamp: new Date(),
        image: null,
      };
      setConversations((prev) => ({
        messages: [...prev.messages, assistantMsg],
      }));
    } catch (error) {
      console.log('Error calling agent:', error);
      const errorMsg: ChatMessage = {
        id: uuidv4(),
        sender: "assistant",
        content: "Something went wrong. Please try agian.",
        type: "text",
        timestamp: new Date(),
        image: null,
      };
      setConversations((prev) => ({
        messages: [...prev.messages, errorMsg],
      }));
    }
  };

  return (
    <Chat conversations={conversations} onSend={handleSend} />
  );
}
