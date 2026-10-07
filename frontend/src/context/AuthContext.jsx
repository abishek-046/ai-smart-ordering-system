import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

/**
 * AuthProvider — manages authentication state for the entire app.
 *
 * Token strategy:
 *  - JWT is stored in localStorage (not httpOnly cookie) because this is
 *    a local campus intranet application, not a public internet service.
 *    For a public deployment, httpOnly cookies with CSRF protection would
 *    be the preferred approach.
 *  - On app start, if a token exists in localStorage, we call GET /auth/me
 *    to validate it and hydrate the user object. An expired or invalid token
 *    causes the catch block to remove it and set user=null.
 *  - The global axios interceptor (in api.js) handles mid-session expiry:
 *    any 401 response clears localStorage and redirects to /login.
 *
 * updateUser() allows profile edits to update the context without a full
 * re-fetch — this keeps the nav bar name immediately in sync.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      authApi.getMe()
        .then((res) => setUser(res.data.user))
        .catch(() => { localStorage.removeItem('token'); localStorage.removeItem('user'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  }, []);

  const register = useCallback(async (data) => {
    const res = await authApi.register(data);
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const updateUser = useCallback((updated) => {
    setUser((prev) => ({ ...prev, ...updated }));
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin: user?.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
