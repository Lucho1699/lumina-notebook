import React, { useState, useEffect, useCallback } from 'react';
import type { User } from '../types/auth';
import { AuthContext } from './authContextDef';

const TOKEN_KEY = 'lumina_auth_token';
const USER_KEY = 'lumina_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    if (!saved) return null;
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Validate session on startup
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        } else if (res.status === 401 || res.status === 403) {
          // Token expired or invalid
          setToken(null);
          setUser(null);
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      } catch (err) {
        // If server is temporarily unreachable, maintain cached user session locally
        console.warn('Lumina Auth: No se pudo contactar el servidor local, manteniendo sesión cacheada:', err);
      } finally {
        setIsLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        return { success: false, error: data.error || 'Credenciales inválidas.' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        error: 'No se pudo conectar al servidor local de autenticación. Asegúrate de ejecutar npm run dev o npm run server.',
      };
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
      try {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error || 'No se pudo crear la cuenta.' };
        }

        setToken(data.token);
        setUser(data.user);
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));

        return { success: true };
      } catch (err) {
        console.error('Register error:', err);
        return {
          success: false,
          error: 'No se pudo conectar al servidor local de autenticación. Asegúrate de ejecutar npm run dev o npm run server.',
        };
      }
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const updateProfile = useCallback(
    async (data: {
      name?: string;
      currentPassword?: string;
      newPassword?: string;
    }): Promise<{ success: boolean; error?: string }> => {
      if (!token) return { success: false, error: 'No hay sesión activa.' };

      try {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        });

        const resData = await res.json();
        if (!res.ok) {
          return { success: false, error: resData.error || 'Error al actualizar perfil.' };
        }

        setUser(resData.user);
        localStorage.setItem(USER_KEY, JSON.stringify(resData.user));
        return { success: true };
      } catch (err) {
        console.error('Update profile error:', err);
        return { success: false, error: 'Error de conexión con el servidor local.' };
      }
    },
    [token]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
