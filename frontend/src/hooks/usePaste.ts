import { useFileReader } from "./useFileReader";

export const usePasteImage = (onPasteImage: (dataUrl: string) => void) => {
  const { readFile } = useFileReader();

  return (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          readFile(file).then(onPasteImage);
        }
        e.preventDefault();
        break;
      }
    }
  };
};
