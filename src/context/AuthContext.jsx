import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase/client.js';
import { signOut as authSignOut } from '../supabase/auth.js';
import { getUserProfile } from '../supabase/queries.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
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

  const refreshProfile = () => {
    const userId = session?.user?.id;
    if (!userId) {
      setProfile(null);
      return Promise.resolve(null);
    }
    return getUserProfile(userId)
      .then((p) => {
        setProfile(p);
        return p;
      })
      .catch(() => {
        setProfile(null);
        return null;
      });
  };

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId) {
      setProfile(null);
      return;
    }
    let active = true;
    getUserProfile(userId)
      .then((p) => {
        if (active) setProfile(p);
      })
      .catch(() => {
        if (active) setProfile(null);
      });
    return () => {
      active = false;
    };
  }, [session?.user?.id]);

  const signOut = async () => {
    await authSignOut();
    setSession(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoggedIn: !!session?.user,
        profile,
        refreshProfile,
        role: profile?.role || null,
        isAdmin: profile?.role === 'admin',
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
