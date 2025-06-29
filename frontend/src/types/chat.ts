export type ChatMessage = {
    id: string
    sender: 'user' | 'assistant'
    content: string;
    type: 'text' | 'markdown'
    timestamp: Date
    image?: string | null;
}

export type ChatHistory = {
    messages: ChatMessage[];
}