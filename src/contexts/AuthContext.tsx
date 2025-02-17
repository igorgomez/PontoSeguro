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

      const { data: user, error } = await supabase
        .from('users')
        .select('id, cpf, name, user_type, active')
        .eq('cpf', cpf)
        .eq('user_type', userType)
        .eq('active', true)
        .single(); // Retorna um objeto único, em vez de array

      if (error) {
        const errorMessage = `Erro ao buscar usuário: ${error.message}`;
        console.error(errorMessage);
        logToFile(errorMessage);
        throw new Error('Erro ao verificar acesso'); // Re-lança o erro para tratamento externo
      }

      if (!user) {
        const notFoundMessage = `Usuário com CPF ${cpf} e tipo ${userType} não encontrado.`;
        console.log(notFoundMessage);
        logToFile(notFoundMessage);
        throw new Error(notFoundMessage);
      }


      setUser(user);
      try {
        localStorage.setItem('ponto_user', JSON.stringify(user));
      } catch (e) {
        console.error("Erro ao salvar no localStorage:", e);
        logToFile(`Erro ao salvar no localStorage: ${e}`);
      }

      console.log("Usuário logado com sucesso:", user);
      logToFile(`Usuário logado com sucesso: ${JSON.stringify(user)}`);

    } catch (error) {
      // Tratar erros específicos aqui, como erros de rede
      console.error("Erro de acesso:", error);
      logToFile(`Erro de acesso: ${error}`);
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