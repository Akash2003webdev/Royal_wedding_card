import { createContext, useContext, useEffect, useState } from 'react';
import { getAllSettings } from '../supabase/queries.js';
import {
  BUSINESS_NAME,
  PHONE_DISPLAY,
  ADDRESS_LINE,
} from '../constants/business.js';

// Defaults used until the "store"/"homepage" rows load, or for any
// field an admin hasn't filled in yet — the site never shows blanks.
const DEFAULT_STORE = {
  storeName: BUSINESS_NAME,
  email: 'info@h1enterprises.in',
  phone: PHONE_DISPLAY,
  address: ADDRESS_LINE,
};

const DEFAULT_HOMEPAGE = {
  heroTitle: 'Every Celebration Begins With A Beautiful Invitation',
  heroSubtitle:
    'Handcrafted wedding, birthday, engagement and housewarming invitations — designed with royal elegance, delivered anywhere in India.',
};

const SettingsContext = createContext({
  store: DEFAULT_STORE,
  homepage: DEFAULT_HOMEPAGE,
  loading: true,
});

export function SettingsProvider({ children }) {
  const [store, setStore] = useState(DEFAULT_STORE);
  const [homepage, setHomepage] = useState(DEFAULT_HOMEPAGE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAllSettings()
      .then((rows) => {
        if (!active) return;
        const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));
        if (byKey.store) setStore((s) => ({ ...s, ...byKey.store }));
        if (byKey.homepage) setHomepage((h) => ({ ...h, ...byKey.homepage }));
      })
      .catch((err) => console.error('Failed to load settings:', err))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ store, homepage, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
