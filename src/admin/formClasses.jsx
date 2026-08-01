export const inputCls =
  'w-full px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-secondary';

export function Field({ label, children, required }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
