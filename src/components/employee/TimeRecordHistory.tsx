import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { History } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function TimeRecordHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState<any[]>([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const { data } = await supabase
      .from('time_records')
      .select('*')
      .eq('employee_id', user?.id)
      .order('date', { ascending: false })
      .limit(10);

    if (data) {
      setRecords(data);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Histórico de Registros</h2>
        <History className="w-6 h-6 text-blue-600" />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entrada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intervalo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saída
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {format(new Date(record.date), "dd/MM/yyyy", { locale: ptBR })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.check_in ? format(new Date(record.check_in), 'HH:mm:ss') : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.break_start && record.break_end
                    ? `${format(new Date(record.break_start), 'HH:mm')} - ${format(
                        new Date(record.break_end),
                        'HH:mm'
                      )}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {record.check_out ? format(new Date(record.check_out), 'HH:mm:ss') : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}