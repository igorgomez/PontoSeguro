import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Users, UserCog } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { verifyAccess } = useAuth();
  const [showCpfInput, setShowCpfInput] = useState(false);
  const [userType, setUserType] = useState<'admin' | 'employee' | null>(null);
  const [cpf, setCpf] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userType) return;

    setError('');
    setLoading(true);

    try {
      await verifyAccess(cpf.replace(/\D/g, ''), userType);
      navigate(userType === 'admin' ? '/admin' : '/employee');
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro ao verificar acesso');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUserTypeSelect = (type: 'admin' | 'employee') => {
    setUserType(type);
    setShowCpfInput(true);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Clock className="w-12 h-12 text-blue-600" />
          <h1 className="text-2xl font-bold ml-2">PontoSeguro</h1>
        </div>

        {!showCpfInput ? (
          <div className="space-y-4">
            <button
              onClick={() => handleUserTypeSelect('employee')}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Users className="w-5 h-5 mr-2" />
              Acesso Funcionário
            </button>
            <button
              onClick={() => handleUserTypeSelect('admin')}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <UserCog className="w-5 h-5 mr-2" />
              Acesso Administrador
            </button>
          </div>
        ) : (
          <form onSubmit={handleAccess} className="space-y-6">
            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
                Digite seu CPF
              </label>
              <input
                type="text"
                id="cpf"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="000.000.000-00"
                maxLength={11}
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => {
                  setShowCpfInput(false);
                  setUserType(null);
                  setCpf('');
                  setError('');
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
              >
                {loading ? 'Verificando...' : 'Acessar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}