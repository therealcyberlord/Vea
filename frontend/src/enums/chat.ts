export enum ChatActionType {
    setInput = 'setInput',
    setInputImagePreview = 'setInputImagePreview',
    setChatImagePreview = 'setChatImagePreview',
    setIsTyping = 'setIsTyping',
    setError = 'setError',
}

export enum ModelActionType {
    setToolModels = 'setToolModels',
    setVisionModels = 'setVisionModels',
    setCurrToolModel = 'setCurrToolModel',
    setCurrVisionModel = 'setCurrVisionModel',
    setLoading = 'setLoading',
    setSaving = 'setSaving',
    setSaved = 'setSaved',
    setError = 'setError',
}