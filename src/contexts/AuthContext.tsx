import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { logToFile } from '../utils/log';

interface User {
  id: string;
  cpf: string;
  name: string;
  user_type: 'admin' | 'employee';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  verifyAccess: (cpf: string, userType: 'admin' | 'employee') => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('ponto_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);

  const verifyAccess = async (cpf: string, userType: 'admin' | 'employee') => {
    setLoading(true);
    try {
      const logMessage = `Verificando acesso para CPF: ${cpf}, Tipo de usuário: ${userType}`;
      console.log(logMessage);
      logToFile(logMessage);

      const adminCpf = process.env.REACT_APP_ADMIN_CPF;
      if (userType === 'admin' && cpf !== adminCpf) {
        throw new Error('CPF não autorizado para acesso administrativo');
      }

      const { data: userData, error } = await supabase
        .from('users')
        .select('id, cpf, name, user_type')
        .eq('cpf', cpf)
        .eq('user_type', userType)
        .eq('active', true)
        .maybeSingle();

      if (error) {
        const errorMessage = `Erro ao buscar usuário: ${error.message}`;
        console.error(errorMessage);
        logToFile(errorMessage);
        throw new Error('Erro ao verificar acesso');
      }

      if (!userData) {
        const notFoundMessage = 'Usuário não encontrado ou inativo';
        console.log(notFoundMessage);
        logToFile(notFoundMessage);
        throw new Error(notFoundMessage);
      }

      const successMessage = `Usuário encontrado: ${JSON.stringify(userData)}`;
      console.log(successMessage);
      logToFile(successMessage);
      setUser(userData);
      localStorage.setItem('ponto_user', JSON.stringify(userData));
    } catch (error) {
      const accessErrorMessage = `Erro de acesso: ${(error as Error).message}`;
      console.error(accessErrorMessage);
      logToFile(accessErrorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('ponto_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, verifyAccess, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};