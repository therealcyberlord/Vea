import { useCallback } from "react";

export const useFileReader = () => {
    const readFile = useCallback((file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }, []);
    
    return { readFile };
  };