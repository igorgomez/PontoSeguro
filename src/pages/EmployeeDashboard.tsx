import React from 'react';
import { LogOut, Clock, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import TimeClockCard from '../components/employee/TimeClockCard';
import TimeRecordHistory from '../components/employee/TimeRecordHistory';

export default function EmployeeDashboard() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <Clock className="w-8 h-8 text-blue-600" />
              <h1 className="ml-2 text-xl font-bold text-blue-600">Ponto Eletrônico</h1>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">Olá, {user?.name}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TimeClockCard />
          <TimeRecordHistory />
        </div>
      </main>
    </div>
  );
}