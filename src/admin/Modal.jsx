import { X } from 'lucide-react';

export default function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-start md:items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div
        className={`w-full ${wide ? 'max-w-2xl' : 'max-w-lg'} bg-white dark:bg-neutral-900 rounded-2xl shadow-premium my-4 sm:my-8`}
      >
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-black/10 dark:border-white/10">
          <h3 className="text-lg font-heading font-bold">{title}</h3>
          <button onClick={onClose} aria-label="Close" className="hover:text-primary">
            <X size={20} />
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
