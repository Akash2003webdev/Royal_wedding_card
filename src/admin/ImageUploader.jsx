import { useRef, useState } from 'react';
import { Upload, X, Loader2, Camera, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImage } from '../supabase/queries.js';

// Controlled image uploader: value is the current image URL (or ''),
// onChange(url) fires once the upload finishes.
// Offers two explicit entry points on mobile: Camera (opens camera directly)
// and Gallery (opens the photo library) — instead of relying on the browser's
// default file-picker chooser, which doesn't always surface the camera option.
export default function ImageUploader({ bucket, folder = '', value, onChange, label = 'Image' }) {
  const [uploading, setUploading] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const doUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage(bucket, file, folder);
      onChange(url);
      toast.success('Image uploaded');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (cameraInputRef.current) cameraInputRef.current.value = '';
      if (galleryInputRef.current) galleryInputRef.current.value = '';
    }
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    doUpload(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      {value ? (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-black/10 dark:border-white/10 mb-2">
          <img src={value} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
            aria-label="Remove image"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="w-full rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-700 mb-2 p-4">
          {uploading ? (
            <div className="flex flex-col items-center justify-center gap-2 text-neutral-400 py-4">
              <Loader2 size={22} className="animate-spin" />
              <span className="text-xs">Uploading...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 flex-1 py-4 rounded-lg text-neutral-400 hover:text-secondary hover:bg-secondary/5 transition-colors"
              >
                <Camera size={22} />
                <span className="text-xs">Camera</span>
              </button>
              <div className="w-px h-12 bg-neutral-300 dark:bg-neutral-700" />
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex flex-col items-center justify-center gap-2 flex-1 py-4 rounded-lg text-neutral-400 hover:text-secondary hover:bg-secondary/5 transition-colors"
              >
                <ImageIcon size={22} />
                <span className="text-xs">Gallery</span>
              </button>
            </div>
          )}
          {/* capture="environment" forces the rear camera to open directly */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
          {/* no capture attr -> opens the normal photo library/gallery */}
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFile}
            disabled={uploading}
          />
        </div>
      )}
    </div>
  );
}
