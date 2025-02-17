import React, { createContext, useContext, useState } from 'react';
import { supabase } from '../lib/supabase';
import { logToFile } from '../utils/log';

interface User {
  id: string;
  cpf: string;
  name: string;
  user_type: 'admin' | 'employee';
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (cpf: string, password: string, userType?: 'admin' | 'employee') => Promise<void>; // Renomeado para signIn
  signOut: () => void;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (cpf: string, password: string, userType?: 'admin' | 'employee') => {
    setLoading(true);
    setError(null);
    try {
      // 1. Autenticação com Supabase (usando CPF como email)
      const { data, error: authError, session } = await supabase.auth.signInWithPassword({
        email: `${cpf}@email.com`, // CPF como email - **ajuste se necessário**
        password,
      });


      if (authError) {
        console.error("Erro de autenticação Supabase:", authError.message);
        logToFile(`Erro de autenticação Supabase: ${authError.message}`);
        setError(authError.message);
        throw authError;
      }

      if (session && data.user) {
        // 2. Buscar dados do usuário na tabela 'users'
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('cpf', cpf)
          .eq('active', true)
          .single();

        if (dbError) {
          console.error("Erro ao buscar usuário:", dbError.message);
          logToFile(`Erro ao buscar usuário: ${dbError.message}`);
          setError(dbError.message);
          throw dbError;
        }

        if (!dbUser) {
          // ... (tratamento de erro - igual ao anterior)
          throw new Error('Usuário não encontrado no banco de dados.');

        }
        if(userType && dbUser.user_type !== userType){
          setError("Tipo de usuário incorreto.");
          throw new Error("Tipo de usuário incorreto.");
        }



        setUser(dbUser);
        localStorage.setItem('ponto_user', JSON.stringify(dbUser));
        console.log("Usuário logado com sucesso:", dbUser);
        logToFile(`Usuário logado com sucesso: ${JSON.stringify(dbUser)}`);

      }


    } catch (error: any) {
        console.error("Erro de acesso:", error.message);
        logToFile(`Erro de acesso: ${error.message}`);
        setError(error?.message || "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  // ... (signOut - sem mudanças)

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, error, setError }}> {/* Atualizado para signIn */}
      {children}
    </AuthContext.Provider>
  );
}


// ... (useAuth - sem mudanças)
