import { useState, useCallback } from 'react';
import { authAPI } from '../api/endpoints';

const TOKEN_KEY = 'ee_token';
const USER_KEY  = 'ee_user';

/**
 * useAuth — manages JWT storage, user state, and role-based helpers.
 *
 * Exposes:
 *   user        — { id, name, email, role } | null
 *   token       — JWT string | null
 *   isAdmin     — boolean
 *   login()     — POST credentials, persist token + user
 *   register()  — POST registration
 *   logout()    — clear storage and state
 */
const useAuth = () => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const persist = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = useCallback(async (email, password) => {
    const { data } = await authAPI.login({ email, password });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password, role = 'student') => {
    const { data } = await authAPI.register({ name, email, password, role });
    persist(data.token, data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return {
    user,
    token,
    isAdmin:       user?.role === 'admin',
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };
};

export default useAuth;
