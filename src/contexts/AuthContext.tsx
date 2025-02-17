import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { logToFile } from '../utils/log';

interface User {
  id: string;
  cpf: string;
  name: string;
  user_type: 'admin' | 'employee';
  active: boolean; // Explicitly include the 'active' field
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  verifyAccess: (cpf: string, userType: 'admin' | 'employee') => Promise<void>;
  signOut: () => void;
  error: string | null; // Add an error state to manage errors
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('ponto_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null); //Added error state


  const verifyAccess = async (cpf: string, userType: 'admin' | 'employee') => {
    setLoading(true);
    setError(null); // Reset error on each attempt
    try {
      const logMessage = `Verificando acesso para CPF: ${cpf}, Tipo de usuário: ${userType}`;
      console.log(logMessage);
      logToFile(logMessage);

      const { data: users, error, status } = await supabase
        .from('users')
        .select('id, cpf, name, user_type, active')
        .eq('cpf', cpf)
        .eq('user_type', userType)
        .eq('active', true);

      if (error) {
        let errorMessage = `Erro ao buscar usuário: ${error.message}`;
        if (status === 406) {
          errorMessage = "CPF duplicado ou usuário não encontrado.";
        } else if (status === 404){
          errorMessage = "Usuário não encontrado.";
        }
        console.error(errorMessage);
        logToFile(errorMessage);
        setError(errorMessage); // Set the error state
        throw new Error(errorMessage);
      }

      if (!users || users.length === 0) {
        setError("Usuário não encontrado.");
        throw new Error("Usuário não encontrado.");
      }

      if (users.length > 1) {
        setError("Múltiplos usuários encontrados com o mesmo CPF. Contate o administrador.");
        throw new Error("Múltiplos usuários encontrados com o mesmo CPF.");
      }

      setUser(users[0]);
      localStorage.setItem('ponto_user', JSON.stringify(users[0]));
      console.log("Usuário logado com sucesso:", users[0]);
      logToFile(`Usuário logado com sucesso: ${JSON.stringify(users[0])}`);

    } catch (error: any) {
      console.error("Erro de acesso:", error);
      logToFile(`Erro de acesso: ${error}`);
      //If error is already set, don't overwrite it
      setError(error?.message || "Erro desconhecido");

    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('ponto_user');
    setError(null); // Clear error on sign out
  };

  return (
    <AuthContext.Provider value={{ user, loading, verifyAccess, signOut, error, setError }}>
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
