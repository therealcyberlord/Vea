export type Message = {
    id: string
    sender: 'user' | 'assistant'
    content: string;
    type: 'text' | 'markdown'
    timestamp: Date
    image?: string | null;
}

export type ChatHistory = {
    messages: Message[];
}

export type MessagePayload = {
    text: string;
    image: string | null;
}