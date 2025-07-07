import { X } from "react-feather";

type ImagePreviewProps = {
  src: string;
  onRemove: () => void;
};

export const ImagePreview = ({ src, onRemove }: ImagePreviewProps) => {
  return (
    <div className="mb-2 flex items-center gap-2 relative w-fit">
      <img
        src={src}
        alt="preview"
        className="max-h-32 rounded-lg border border-gray-200"
      />
      <button
        type="button"
        className="absolute top-1 right-1 p-1 bg-white/80 rounded-full hover:bg-red-100 text-red-500 shadow"
        onClick={onRemove}
        aria-label="Remove image preview"
        style={{ lineHeight: 0 }}
      >
        <X size={16} />
      </button>
    </div>
  );
};
