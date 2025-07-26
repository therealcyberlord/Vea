import { useEffect, useReducer, useCallback } from 'react';
import { getAvailableOllamaModels, updateModelConfig } from '@/api/ollama';
import { ModelActionType } from '@/enums/chat';

export type ToolConfig = {
  web_search: boolean;
  weather: boolean;
  math: boolean;
};

type ConfigState = {
  toolModels: string[];
  visionModels: string[];
  currToolModel: string;
  currVisionModel: string;
  toolConfig: ToolConfig;
  loading: boolean;
  saving: boolean;
  saved: boolean;
  error: string | null;
};

type ConfigAction =
  | { type: ModelActionType.setToolModels; payload: string[] }
  | { type: ModelActionType.setVisionModels; payload: string[] }
  | { type: ModelActionType.setCurrToolModel; payload: string }
  | { type: ModelActionType.setCurrVisionModel; payload: string }
  | { type: ModelActionType.toggleTool; payload: keyof ToolConfig }
  | { type: ModelActionType.setLoading; payload: boolean }
  | { type: ModelActionType.setSaving; payload: boolean }
  | { type: ModelActionType.setSaved; payload: boolean }
  | { type: ModelActionType.setError; payload: string | null };

const initialState: ConfigState = {
  toolModels: [],
  visionModels: [],
  currToolModel: '',
  currVisionModel: '',
  toolConfig: {
    web_search: true,
    weather: true,
    math: true,
  },
  loading: true,
  saving: false,
  saved: false,
  error: null,
};

const configReducer = (state: ConfigState, action: ConfigAction): ConfigState => {
  switch (action.type) {
    case ModelActionType.setToolModels:
      return { ...state, toolModels: action.payload };
    case ModelActionType.setVisionModels:
      return { ...state, visionModels: action.payload };
    case ModelActionType.setCurrToolModel:
      return { ...state, currToolModel: action.payload };
    case ModelActionType.setCurrVisionModel:
      return { ...state, currVisionModel: action.payload };
    case ModelActionType.toggleTool:
      return {
        ...state,
        toolConfig: {
          ...state.toolConfig,
          [action.payload]: !state.toolConfig[action.payload]
        }
      };
    case ModelActionType.setLoading:
      return { ...state, loading: action.payload };
    case ModelActionType.setSaving:
      return { ...state, saving: action.payload };
    case ModelActionType.setSaved:
      return { ...state, saved: action.payload };
    case ModelActionType.setError:
      return { ...state, error: action.payload };
    default:
      return state;
  }
};

export const useModelConfig = () => {
  const [state, dispatch] = useReducer(configReducer, initialState);

  // Load models and config once      
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const data = await getAvailableOllamaModels();
        dispatch({type: ModelActionType.setCurrToolModel, payload: data.currToolModel});
        dispatch({type: ModelActionType.setCurrVisionModel, payload: data.currVisionModel});
        dispatch({ type: ModelActionType.setError, payload: null });
        dispatch({ type: ModelActionType.setToolModels, payload: data.tool || [] });
        dispatch({ type: ModelActionType.setVisionModels, payload: data.vision || [] });
      } catch {
        dispatch({ type: ModelActionType.setError, payload: 'Failed to fetch model list.' });
      } finally {
        dispatch({ type: ModelActionType.setLoading, payload: false });
      }
    };

    fetchModels();
  }, []);

  const setCurrToolModel = useCallback((val: string) => {
    dispatch({ type: ModelActionType.setCurrToolModel, payload: val });
  }, []);

  const setCurrVisionModel = useCallback((val: string) => {
    dispatch({ type: ModelActionType.setCurrVisionModel, payload: val });
  }, []);

  const toggleTool = useCallback((tool: keyof ToolConfig) => {
    dispatch({ type: ModelActionType.toggleTool, payload: tool });
  }, []);

  const saveConfig = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch({ type: ModelActionType.setSaving, payload: true });
    dispatch({ type: ModelActionType.setError, payload: null });

    try {
      await updateModelConfig({
        toolModel: state.currToolModel,
        imageModel: state.currVisionModel,
      });
      dispatch({ type: ModelActionType.setSaved, payload: true });
    } catch (err) {
      console.error('Error saving config:', err);
      dispatch({
        type: ModelActionType.setError,
        payload: 'Failed to save configuration, please double-check config/agent.yaml',
      });
    } finally {
      dispatch({ type: ModelActionType.setSaving, payload: false });
      setTimeout(() => {
        dispatch({ type: ModelActionType.setSaved, payload: false });
      }, 2000);
    }
  }, [state.currToolModel, state.currVisionModel]);

  return {
    state,
    actions: {
      setCurrToolModel,
      setCurrVisionModel,
      toggleTool,
      saveConfig,
    },
  };
};
