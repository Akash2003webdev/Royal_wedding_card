import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client.js';
import { signOut as authSignOut } from '../supabase/auth.js';
import { getUserRole } from '../supabase/queries.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setRole(null);
      return;
    }
    let active = true;
    getUserRole(userId)
      .then((r) => {
        if (active) setRole(r);
      })
      .catch(() => {
        if (active) setRole('user');
      });
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const signOut = async () => {
    await authSignOut();
    setSession(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoggedIn: !!session?.user,
        role,
        isAdmin: role === 'admin',
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
