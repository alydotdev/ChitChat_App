import { X } from "lucide-react";

const ImageLightbox = ({ src, onClose }) => {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        className="absolute top-4 right-4 btn btn-circle btn-ghost text-white"
        onClick={onClose}
        type="button"
      >
        <X size={24} />
      </button>
      <img
        src={src}
        alt="Full size"
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ImageLightbox;
