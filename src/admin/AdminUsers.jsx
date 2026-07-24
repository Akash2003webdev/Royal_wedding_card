import { useEffect, useState } from 'react';
import { ShieldCheck, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { adminGetUsers, updateUserRole } from '../supabase/queries.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user: currentUser } = useAuth();

  const load = () => {
    setLoading(true);
    adminGetUsers()
      .then(setUsers)
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const toggleRole = async (u) => {
    const nextRole = u.role === 'admin' ? 'user' : 'admin';
    if (u.id === currentUser?.id && nextRole === 'user') {
      if (!confirm("You're about to remove your own admin access. Continue?")) return;
    }
    try {
      await updateUserRole(u.id, nextRole);
      toast.success(`${u.full_name || 'User'} is now ${nextRole}`);
      load();
    } catch (err) {
      toast.error(err.message || 'Update failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-heading font-bold mb-6">Users</h1>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="grid gap-3 sm:hidden">
            {users.map((u) => (
              <div key={u.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-black/5 dark:border-white/10 p-3">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">
                      {u.full_name || '—'}{u.id === currentUser?.id && <span className="text-xs text-neutral-400"> (you)</span>}
                    </p>
                    <p className="text-xs text-neutral-500">{u.phone || '—'}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${u.role === 'admin' ? 'bg-primary text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}`}>
                    {u.role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />} {u.role}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-400">Joined {new Date(u.created_at).toLocaleDateString()}</p>
                  <button
                    onClick={() => toggleRole(u)}
                    className="text-xs px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-secondary transition-colors"
                  >
                    Make {u.role === 'admin' ? 'User' : 'Admin'}
                  </button>
                </div>
              </div>
            ))}
            {users.length === 0 && <p className="text-neutral-400 text-center py-10">No users yet.</p>}
          </div>

          {/* Tablet & up: table */}
          <div className="hidden sm:block bg-white dark:bg-neutral-900 rounded-2xl border border-black/5 dark:border-white/10 overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="bg-accent/60 dark:bg-neutral-800 text-left">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Joined</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-black/5 dark:border-white/10">
                    <td className="p-3 font-medium">{u.full_name || '—'}{u.id === currentUser?.id && <span className="text-xs text-neutral-400"> (you)</span>}</td>
                    <td className="p-3 text-neutral-500">{u.phone || '—'}</td>
                    <td className="p-3 text-neutral-500">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full w-fit ${u.role === 'admin' ? 'bg-primary text-white' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}`}>
                        {u.role === 'admin' ? <ShieldCheck size={12} /> : <User size={12} />} {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleRole(u)}
                        className="text-xs px-3 py-1.5 rounded-full border border-neutral-300 dark:border-neutral-700 hover:border-secondary transition-colors"
                      >
                        Make {u.role === 'admin' ? 'User' : 'Admin'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={5} className="p-8 text-center text-neutral-400">No users yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
