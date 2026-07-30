import { useRef, useState } from 'react';
import { Camera, Image as ImageIcon, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { uploadImage } from '../supabase/queries.js';

// Circular avatar editor for a logged-in user's profile. Unlike
// AvatarPicker (signup, no session yet), this uploads immediately —
// there's already an authenticated session to satisfy the storage RLS.
export default function ProfileAvatarEditor({ userId, value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadImage('avatars', file, userId);
      onChange(url);
      toast.success('Photo updated');
    } catch (err) {
      toast.error(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-neutral-200 dark:border-neutral-700 bg-accent dark:bg-neutral-800 flex items-center justify-center">
        {uploading ? (
          <Loader2 size={24} className="animate-spin text-neutral-400" />
        ) : value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <User size={32} className="text-neutral-400" />
        )}
      </div>
      <div className="flex items-center gap-4 text-xs">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 text-secondary font-medium hover:underline disabled:opacity-50"
        >
          <Camera size={14} /> Camera
        </button>
        <button
          type="button"
          onClick={() => galleryInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1 text-secondary font-medium hover:underline disabled:opacity-50"
        >
          <ImageIcon size={14} /> Gallery
        </button>
      </div>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />
    </div>
  );
}
