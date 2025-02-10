import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';

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
      console.log(`Verificando acesso para CPF: ${cpf}, Tipo de usuário: ${userType}`);

      // Verificar se é admin tentando acessar
      if (userType === 'admin' && cpf !== '00922256403') {
        throw new Error('CPF não autorizado para acesso administrativo');
      }

      // Buscar usuário no banco de dados
      const { data: userData, error } = await supabase
        .from('users')
        .select('id, cpf, name, user_type')
        .eq('cpf', cpf)
        .eq('user_type', userType)
        .eq('active', true)
        .maybeSingle();

      if (error) {
        console.error('Erro ao buscar usuário:', error);
        throw new Error('Erro ao verificar acesso');
      }

      if (!userData) {
        console.log('Usuário não encontrado ou inativo');
        throw new Error('Usuário não encontrado ou inativo');
      }

      console.log('Usuário encontrado:', userData);
      setUser(userData);
      localStorage.setItem('ponto_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro de acesso:', error);
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