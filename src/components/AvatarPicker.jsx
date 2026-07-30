import { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, User, X } from 'lucide-react';

// Circular avatar picker for the signup form. Unlike ImageUploader, this
// does NOT upload immediately — there's no authenticated session yet
// before signup completes. It just captures the File + a local preview;
// the caller uploads it once the account exists.
export default function AvatarPicker({ file, onChange }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handlePick = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setPreviewUrl(URL.createObjectURL(f));
    onChange(f);
    e.target.value = '';
  };

  const clear = () => {
    setPreviewUrl(null);
    onChange(null);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-neutral-300 dark:border-neutral-700 bg-accent dark:bg-neutral-800 flex items-center justify-center">
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={clear}
              className="absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
              aria-label="Remove photo"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <User size={32} className="text-neutral-400" />
        )}
      </div>
      <div className="flex items-center gap-4 text-xs">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex items-center gap-1 text-secondary font-medium hover:underline"
        >
          <Camera size={14} /> Camera
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          className="flex items-center gap-1 text-secondary font-medium hover:underline"
        >
          <ImageIcon size={14} /> Gallery
        </button>
      </div>
      {/* capture="environment" opens the rear camera directly */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePick}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handlePick}
      />
    </div>
  );
}
