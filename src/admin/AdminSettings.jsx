import { useEffect, useState } from 'react';
import { Plus, Trash2, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllSettings, upsertSetting } from '../supabase/queries.js';
import { supabase } from '../supabase/client.js';
import Modal from './Modal.jsx';
import { inputCls, Field } from './formClasses.jsx';

export default function AdminSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getAllSettings()
      .then(setSettings)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let value = creating.value;
      try {
        value = JSON.parse(creating.value);
      } catch {
        // keep as a plain string if it isn't valid JSON
      }
      await upsertSetting(creating.key, value);
      toast.success('Setting saved');
      setCreating(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (s) => {
    if (!confirm(`Delete setting "${s.key}"?`)) return;
    try {
      const { error } = await supabase.from('settings').delete().eq('key', s.key);
      if (error) throw error;
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-heading font-bold">Settings</h1>
        <button
          onClick={() => setCreating({ key: '', value: '' })}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm font-semibold hover:scale-[1.02] transition-transform"
        >
          <Plus size={16} /> New Setting
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="grid gap-3 sm:hidden">
            {settings.map((s) => (
              <div key={s.key} className="bg-white dark:bg-neutral-900 rounded-2xl border border-black/5 dark:border-white/10 p-3">
                <p className="font-mono text-xs font-semibold mb-1">{s.key}</p>
                <p className="text-neutral-500 truncate font-mono text-xs mb-3">{JSON.stringify(s.value)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCreating({ key: s.key, value: JSON.stringify(s.value, null, 2) })}
                    className="flex-1 text-xs px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-secondary transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className="flex items-center justify-center px-3 py-1.5 rounded-full border border-red-300 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {settings.length === 0 && <p className="text-neutral-400 text-center py-10">No settings yet.</p>}
          </div>

          {/* Tablet & up: table */}
          <div className="hidden sm:block bg-white dark:bg-neutral-900 rounded-2xl border border-black/5 dark:border-white/10 overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-accent/60 dark:bg-neutral-800 text-left">
                <tr>
                  <th className="p-3">Key</th>
                  <th className="p-3">Value</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {settings.map((s) => (
                  <tr key={s.key} className="border-t border-black/5 dark:border-white/10">
                    <td className="p-3 font-mono text-xs">{s.key}</td>
                    <td className="p-3 text-neutral-500 max-w-md truncate font-mono text-xs">{JSON.stringify(s.value)}</td>
                    <td className="p-3 text-right flex justify-end gap-2">
                      <button
                        onClick={() => setCreating({ key: s.key, value: JSON.stringify(s.value, null, 2) })}
                        className="text-xs px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-secondary transition-colors"
                      >
                        Edit
                      </button>
                      <button onClick={() => handleDelete(s)} className="text-red-400 hover:text-red-500" aria-label="Delete">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {settings.length === 0 && (
                  <tr><td colSpan={3} className="p-8 text-center text-neutral-400">No settings yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {creating && (
        <Modal title="Save Setting" onClose={() => setCreating(null)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Field label="Key">
              <input
                required
                value={creating.key}
                onChange={(e) => setCreating((s) => ({ ...s, key: e.target.value }))}
                placeholder="whatsapp_number"
                className={inputCls}
              />
            </Field>
            <Field label="Value (plain text or JSON)">
              <textarea
                required
                rows={4}
                value={creating.value}
                onChange={(e) => setCreating((s) => ({ ...s, value: e.target.value }))}
                placeholder='"+91 98765 43210" or {"days": [1,2,3]}'
                className={`${inputCls} font-mono text-xs`}
              />
            </Field>
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-full font-semibold hover:scale-[1.01] transition-transform disabled:opacity-60"
            >
              <Save size={16} /> {saving ? 'Saving...' : 'Save Setting'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
