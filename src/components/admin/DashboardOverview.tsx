import React, { useState, useEffect } from 'react';
import { Users, Clock, AlertTriangle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';

interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  totalHoursThisMonth: number;
  lateRecords: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    totalHoursThisMonth: 0,
    lateRecords: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch employee counts
      const { data: employeesData } = await supabase
        .from('users')
        .select('active')
        .eq('user_type', 'employee');

      const totalEmployees = employeesData?.length || 0;
      const activeEmployees = employeesData?.filter((emp) => emp.active).length || 0;

      // Fetch this month's records
      const start = startOfMonth(new Date());
      const end = endOfMonth(new Date());

      const { data: recordsData } = await supabase
        .from('time_records')
        .select('*')
        .gte('date', format(start, 'yyyy-MM-dd'))
        .lte('date', format(end, 'yyyy-MM-dd'));

      let totalMinutes = 0;
      let lateRecords = 0;

      if (recordsData) {
        recordsData.forEach((record) => {
          if (record.check_in && record.check_out) {
            const checkIn = new Date(record.check_in);
            const checkOut = new Date(record.check_out);
            let duration = differenceInMinutes(checkOut, checkIn);

            if (record.break_start && record.break_end) {
              const breakStart = new Date(record.break_start);
              const breakEnd = new Date(record.break_end);
              const breakDuration = differenceInMinutes(breakEnd, breakStart);
              duration -= breakDuration;
            }

            totalMinutes += duration;
          }

          // Check for late arrivals (after 9:00 AM)
          if (record.check_in) {
            const checkInTime = new Date(record.check_in);
            const scheduleStart = new Date(record.check_in);
            scheduleStart.setHours(9, 0, 0);

            if (checkInTime > scheduleStart) {
              lateRecords++;
            }
          }
        });
      }

      setStats({
        totalEmployees,
        activeEmployees,
        totalHoursThisMonth: Math.round((totalMinutes / 60) * 100) / 100,
        lateRecords,
      });
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total de Funcionários</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalEmployees}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {stats.activeEmployees} ativos / {stats.totalEmployees - stats.activeEmployees} inativos
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Horas Trabalhadas (Mês)</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.totalHoursThisMonth.toFixed(1)}h
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Média: {(stats.totalHoursThisMonth / stats.activeEmployees).toFixed(1)}h por funcionário
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Atrasos no Mês</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.lateRecords}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Média: {(stats.lateRecords / stats.activeEmployees).toFixed(1)} por funcionário
          </p>
        </div>
      </div>

      {/* Additional charts and statistics can be added here */}
    </div>
  );
}