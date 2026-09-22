import { useEffect, useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllSettings, upsertSetting } from '../supabase/queries.js';
import { supabase } from '../supabase/client.js';
import Modal from './Modal.jsx';
import { inputCls, Field } from './formClasses.jsx';

const humanize = (key) =>
  key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/^./, (c) => c.toUpperCase());

// Turn a settings row's value into an array of {name, value} rows for the form.
// Nested objects/arrays fall back to a JSON string so nothing is lost.
const toFieldRows = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const entries = Object.entries(value);
    if (entries.length > 0) {
      return entries.map(([name, v]) => ({
        name,
        value: v && typeof v === 'object' ? JSON.stringify(v) : String(v ?? ''),
      }));
    }
  }
  // Plain string/number/array settings just become a single "value" field
  return [{ name: 'value', value: value && typeof value === 'object' ? JSON.stringify(value) : String(value ?? '') }];
};

export default function AdminSettings() {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null); // { key, fields: [{name, value}] }
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getAllSettings()
      .then(setSettings)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openNew = () => setCreating({ key: '', fields: [{ name: '', value: '' }] });

  const openEdit = (s) => setCreating({ key: s.key, fields: toFieldRows(s.value) });

  const updateField = (idx, patch) =>
    setCreating((c) => ({
      ...c,
      fields: c.fields.map((f, i) => (i === idx ? { ...f, ...patch } : f)),
    }));

  const addField = () =>
    setCreating((c) => ({ ...c, fields: [...c.fields, { name: '', value: '' }] }));

  const removeField = (idx) =>
    setCreating((c) => ({ ...c, fields: c.fields.filter((_, i) => i !== idx) }));

  // A single field literally named "value" means: save it as a plain value, not an object
  const isSingleValueForm = creating?.fields.length === 1 && creating.fields[0].name === 'value';

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      let value;
      if (isSingleValueForm) {
        const raw = creating.fields[0].value;
        try {
          value = JSON.parse(raw);
        } catch {
          value = raw; // keep as plain string if it isn't valid JSON
        }
      } else {
        value = {};
        for (const f of creating.fields) {
          const name = f.name.trim();
          if (!name) continue;
          try {
            value[name] = JSON.parse(f.value);
          } catch {
            value[name] = f.value;
          }
        }
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

  const preview = (value) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return Object.entries(value)
        .map(([k, v]) => `${k}: ${v}`)
        .join('  •  ');
    }
    return JSON.stringify(value);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-heading font-bold">Settings</h1>
        <button
          onClick={openNew}
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
                <p className="text-neutral-500 truncate text-xs mb-3">{preview(s.value)}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(s)}
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
                    <td className="p-3 text-neutral-500 max-w-md truncate text-xs">{preview(s.value)}</td>
                    <td className="p-3 text-right flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(s)}
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
            <Field label="Key" required>
              <input
                required
                disabled={settings.some((s) => s.key === creating.key)}
                value={creating.key}
                onChange={(e) => setCreating((c) => ({ ...c, key: e.target.value }))}
                placeholder="store"
                className={`${inputCls} disabled:opacity-60 disabled:cursor-not-allowed`}
              />
            </Field>

            <div className="space-y-3">
              {creating.fields.map((f, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  {isSingleValueForm ? (
                    <Field label="Value" required>
                      <input
                        required
                        value={f.value}
                        onChange={(e) => updateField(idx, { value: e.target.value })}
                        placeholder="+91 98765 43210"
                        className={inputCls}
                      />
                    </Field>
                  ) : (
                    <>
                      <div className="flex-[0_0_38%]">
                        <Field label={idx === 0 ? 'Field name' : ''}>
                          <input
                            value={f.name}
                            onChange={(e) => updateField(idx, { name: e.target.value })}
                            placeholder="e.g. email"
                            className={`${inputCls} text-sm`}
                          />
                        </Field>
                      </div>
                      <div className="flex-1">
                        <Field label={idx === 0 ? 'Value' : ''}>
                          <input
                            value={f.value}
                            onChange={(e) => updateField(idx, { value: e.target.value })}
                            placeholder={f.name ? humanize(f.name) : 'Value'}
                            className={`${inputCls} text-sm`}
                          />
                        </Field>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeField(idx)}
                        disabled={creating.fields.length === 1}
                        className="mb-0.5 p-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-red-400 hover:bg-red-500 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
                        aria-label="Remove field"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addField}
              className="flex items-center gap-1.5 text-xs font-semibold text-secondary hover:underline"
            >
              <Plus size={14} /> Add field
            </button>

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
