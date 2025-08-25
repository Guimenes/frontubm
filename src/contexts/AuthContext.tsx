import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (userData: AuthUser, token: string, expiresAt: Date) => void;
  logout: () => void;
  updateUser: (userData: AuthUser) => void;
  isLoading: boolean;
  hasPermission: (permissao: string) => boolean;
  hasAnyPermission: (permissoes: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para verificar se o token expirou
  const isTokenExpired = (expiresAt: string): boolean => {
    return new Date() >= new Date(expiresAt);
  };

  // Função para limpar dados de autenticação
  const clearAuthData = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiresAt');
    setUser(null);
  };

  useEffect(() => {
    // Verificar se há um usuário logado no localStorage ao inicializar
    const checkAuthStatus = () => {
      try {
        const token = localStorage.getItem('authToken');
        const userData = localStorage.getItem('user');
        const expiresAt = localStorage.getItem('tokenExpiresAt');
        
        if (token && userData && expiresAt) {
          // Verificar se o token expirou
          if (isTokenExpired(expiresAt)) {
            console.log('Token expirado, fazendo logout automático');
            clearAuthData();
          } else {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar status de autenticação:', error);
        clearAuthData();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Verificar periodicamente se o token expirou (a cada 5 minutos)
    const interval = setInterval(() => {
      const expiresAt = localStorage.getItem('tokenExpiresAt');
      if (expiresAt && isTokenExpired(expiresAt)) {
        console.log('Token expirou, fazendo logout automático');
        clearAuthData();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, []);

  const login = (userData: AuthUser, token: string, expiresAt?: Date) => {
    setUser(userData);
    localStorage.setItem('authToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Se expiresAt não foi fornecido, calcular automaticamente (2 horas a partir de agora)
    const tokenExpiresAt = expiresAt || new Date(Date.now() + 2 * 60 * 60 * 1000);
    localStorage.setItem('tokenExpiresAt', tokenExpiresAt.toISOString());
  };

  const logout = () => {
    clearAuthData();
  };

  const updateUser = (userData: AuthUser) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const hasPermission = (permissao: string): boolean => {
    if (!user || !user.permissoes) return false;
    return user.permissoes.includes(permissao);
  };

  const hasAnyPermission = (permissoes: string[]): boolean => {
    if (!user || !user.permissoes) return false;
    return permissoes.some(permissao => user.permissoes.includes(permissao));
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    isLoading,
    hasPermission,
    hasAnyPermission
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
