import { useReducer, useCallback } from 'react';
import { ChatActionType } from '@/enums/chat';

type ChatState = {
    input: string;
    inputImagePreview: string | null;
    chatImagePreview: string | null;
    isTyping: boolean;
    error: string | null;
}

type ChatAction = {
    type: ChatActionType.setInput;
    payload: string;
} | {
    type: ChatActionType.setInputImagePreview;
    payload: string | null;
} | {
    type: ChatActionType.setChatImagePreview;
    payload: string | null;
} | {
    type: ChatActionType.setIsTyping;
    payload: boolean;
} | {
    type: ChatActionType.setError;
    payload: string | null;
}

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
    switch (action.type) {
        case ChatActionType.setInput:
            return { ...state, input: action.payload };
        case ChatActionType.setInputImagePreview:
            return { ...state, inputImagePreview: action.payload };
        case ChatActionType.setChatImagePreview:
            return { ...state, chatImagePreview: action.payload };
        case ChatActionType.setIsTyping:
            return { ...state, isTyping: action.payload };
        case ChatActionType.setError:
            return { ...state, error: action.payload };
        default:
            return state;
    }
}

const initialState: ChatState = {
    input: '',
    inputImagePreview: null,
    chatImagePreview: null,
    isTyping: false,
    error: null,
  };

export const useChatState = () => {
   const [state, dispatch] = useReducer(chatReducer, initialState);

   const actions = {
    setInput: useCallback((input: string) => {
        dispatch({ type: ChatActionType.setInput, payload: input });
    }, []),
    setInputImagePreview: useCallback((inputImagePreview: string | null) => {
        dispatch({ type: ChatActionType.setInputImagePreview, payload: inputImagePreview });
    }, []),
    setChatImagePreview: useCallback((chatImagePreview: string | null) => {
        dispatch({ type: ChatActionType.setChatImagePreview, payload: chatImagePreview });
    }, []),
    setIsTyping: useCallback((isTyping: boolean) => {
        dispatch({ type: ChatActionType.setIsTyping, payload: isTyping });
    }, []),
    setError: useCallback((error: string | null) => {
        dispatch({ type: ChatActionType.setError, payload: error });
    }, []),
   }

   return { state, actions };
}


  