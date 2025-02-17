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
  signIn: (cpf: string, password: string, userType?: 'admin' | 'employee') => Promise<void>;
  signOut: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async (cpf: string, password: string, userType?: 'admin' | 'employee') => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError, session } = await supabase.auth.signInWithPassword({
        email: `${cpf}@email.com`, // CPF como email - **ajuste se necessário**
        password,
      });

      if (authError) {
        // Log do erro (console e arquivo)
        console.error("Erro de autenticação Supabase:", authError.message);
        logToFile(`Erro de autenticação Supabase: ${authError.message}`);
        setError(authError.message);
        throw authError; 
      }

      if (session && data.user) {
        const { data: dbUser, error: dbError } = await supabase
          .from('users')
          .select('*')
          .eq('cpf', cpf)
          .eq('active', true)
          .single();

        if (dbError) {
          // Log do erro (console e arquivo)
          console.error("Erro ao buscar usuário:", dbError.message);
          logToFile(`Erro ao buscar usuário: ${dbError.message}`);
          setError(dbError.message);
          throw dbError;
        }

        if (!dbUser) {
          setError('Usuário não encontrado no banco de dados.');
          throw new Error('Usuário não encontrado no banco de dados.');
        }

        if (userType && dbUser.user_type !== userType) {
          setError("Tipo de usuário incorreto.");
          throw new Error("Tipo de usuário incorreto.");
        }

        setUser(dbUser);
        localStorage.setItem('ponto_user', JSON.stringify(dbUser));
        console.log("Usuário logado com sucesso:", dbUser);
        logToFile(`Usuário logado com sucesso: ${JSON.stringify(dbUser)}`);
      }
    } catch (error: any) {  // Captura erros genéricos
      console.error("Erro geral de acesso:", error.message); // Log mais descritivo
      logToFile(`Erro geral de acesso: ${error.message}`);
      setError(error.message || "Erro desconhecido."); // Define a mensagem de erro no estado
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    supabase.auth.signOut();  // Certifique-se de deslogar do Supabase também
    setUser(null);
    localStorage.removeItem('ponto_user');
    setError(null);
  };



  const memoedValue = React.useMemo(() => ({ user, loading, signIn, signOut, error }), [user, loading, error]);

  return (
    <AuthContext.Provider value={memoedValue}>
      {children}
    </AuthContext.Provider>
  );
};



export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
