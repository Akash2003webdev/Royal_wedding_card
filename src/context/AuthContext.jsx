import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../supabase/client.js";
import { signOut as authSignOut } from "../supabase/auth.js";
import { getUserProfile } from "../supabase/queries.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  // Set true only on an actual sign-in event (email or Google), never on a
  // page refresh that just restores an existing session.
  const justSignedInRef = useRef(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (event === "SIGNED_IN") justSignedInRef.current = true;
        setSession(newSession);
      },
    );

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
        if (!active) return;
        setProfile(p);
        if (justSignedInRef.current) {
          justSignedInRef.current = false;
          if (p?.role === "admin" && !location.pathname.startsWith("/admin")) {
            navigate("/admin", { replace: true });
          }
        }
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
        isAdmin: profile?.role === "admin",
        loading,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
