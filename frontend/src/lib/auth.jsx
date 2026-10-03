import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from './api.js';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await api.getSession();
      setProfile(data.profile);
      setUser({ id: data.profile.id });
    } catch {
      api.setToken(null);
      setUser(null);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    const token = api.getToken();
    if (token) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const signIn = useCallback(async (email, password) => {
    try {
      const data = await api.login(email, password);
      api.setToken(data.token);
      setUser({ id: data.profile.id });
      setProfile(data.profile);
      return { error: null, profile: data.profile };
    } catch (err) {
      return { error: err.message };
    }
  }, []);

  const signOut = useCallback(async () => {
    api.setToken(null);
    setUser(null);
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    await fetchProfile();
  }, [fetchProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
