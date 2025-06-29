import { Upload } from "react-feather";
import React from "react";

type UploadButtonProps = {
  onFileSelect: (file: File) => void;
};

export const UploadButton = ({ onFileSelect }: UploadButtonProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <label className="p-2 rounded-xl border-2 border-transparent flex items-center justify-center text-gray-600 hover:bg-gray-100 focus:outline-none transition-all duration-200 cursor-pointer">
      <Upload size={20} />
      <input
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        className="hidden"
        onChange={handleChange}
      />
    </label>
  );
};