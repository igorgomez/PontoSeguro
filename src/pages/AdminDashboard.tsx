import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Users, Calendar, ClipboardList, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import EmployeeList from '../components/admin/EmployeeList';
import ScheduleManagement from '../components/admin/ScheduleManagement';
import TimeRecords from '../components/admin/TimeRecords';
import DashboardOverview from '../components/admin/DashboardOverview';

export default function AdminDashboard() {
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
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-blue-600">PontoSeguro</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/admin"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  to="/admin/employees"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Funcionários
                </Link>
                <Link
                  to="/admin/schedules"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Horários
                </Link>
                <Link
                  to="/admin/records"
                  className="inline-flex items-center px-1 pt-1 text-gray-900 hover:text-blue-600"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Registros
                </Link>
              </div>
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

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="schedules" element={<ScheduleManagement />} />
          <Route path="records" element={<TimeRecords />} />
        </Routes>
      </main>
    </div>
  );
}