export const getAvailableOllamaModels = async () => {
    const response = await fetch('http://127.0.0.1:8000/show-ollama-models', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return data;
}


type ModelConfig = {
  toolModel: string;
  imageModel: string;
}


export const updateModelConfig = async (config: ModelConfig) => {
    const response = await fetch('http://127.0.1:8000/update-model-config/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
    });
    if (!response.ok) {
        throw new Error('Failed to update model configuration');
    }
    const data = await response.json();
    return data;
}