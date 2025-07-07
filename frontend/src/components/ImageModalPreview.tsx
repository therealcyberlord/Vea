type ImageModalPreviewProps = {
  src: string;
  onClose: () => void;
};

export const ImageModalPreview = ({ src, onClose }: ImageModalPreviewProps) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <img
        src={src}
        alt="preview-large"
        className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-2xl border-4 border-white"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        className="absolute top-6 right-8 text-white text-3xl font-bold bg-black/40 rounded-full px-3 py-1 hover:bg-black/70 transition"
        onClick={onClose}
        aria-label="Close preview"
      >
        ×
      </button>
    </div>
  );
};
