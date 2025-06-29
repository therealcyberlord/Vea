import { stripBase64Header } from "../utils/image";

type AgentInput = {
    query: string;
    imageData?: string;
    webSearchEnabled?: boolean;
};

export const callVeaAgent = async (input: AgentInput) => {
    const image = input.imageData ? stripBase64Header(input.imageData) : "";
    const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query: input.query,
            imageData: image,
            webSearchEnabled: input.webSearchEnabled ?? false,
        }),
    });
    const data = await response.json();
    return data;
}