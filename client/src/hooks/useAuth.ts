// hooks/useAuth.ts
import { useState } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (email: string, password: string, twoFactorCode: string) => {
    // lógica real
    setIsAuthenticated(true);
  };

  const logout = () => setIsAuthenticated(false);

  return { isAuthenticated, login, logout };
}