import React, { useState, useEffect } from 'react';
import { ClipboardList, Download } from 'lucide-react';
import { format, startOfMonth, endOfMonth, differenceInHours, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../../lib/supabase';

interface TimeRecord {
  id: string;
  employee_id: string;
  date: string;
  check_in: string;
  break_start: string | null;
  break_end: string | null;
  check_out: string | null;
}

interface Employee {
  id: string;
  name: string;
}

export default function TimeRecords() {
  const [records, setRecords] = useState<TimeRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [loading, setLoading] = useState(true);
  const [totalHours, setTotalHours] = useState(0);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee && selectedMonth) {
      fetchRecords();
    }
  }, [selectedEmployee, selectedMonth]);

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, name')
      .eq('user_type', 'employee')
      .order('name');

    if (data) {
      setEmployees(data);
      if (data.length > 0) {
        setSelectedEmployee(data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchRecords = async () => {
    const start = startOfMonth(new Date(selectedMonth));
    const end = endOfMonth(new Date(selectedMonth));

    const { data } = await supabase
      .from('time_records')
      .select('*')
      .eq('employee_id', selectedEmployee)
      .gte('date', format(start, 'yyyy-MM-dd'))
      .lte('date', format(end, 'yyyy-MM-dd'))
      .order('date', { ascending: true });

    if (data) {
      setRecords(data);
      calculateTotalHours(data);
    }
  };

  const calculateTotalHours = (records: TimeRecord[]) => {
    let total = 0;

    records.forEach((record) => {
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

        total += duration;
      }
    });

    setTotalHours(Math.round((total / 60) * 100) / 100);
  };

  const exportToCSV = () => {
    const headers = ['Data', 'Entrada', 'Início Intervalo', 'Fim Intervalo', 'Saída', 'Horas Trabalhadas'];
    const rows = records.map((record) => {
      let hoursWorked = 0;
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

        hoursWorked = Math.round((duration / 60) * 100) / 100;
      }

      return [
        format(new Date(record.date), 'dd/MM/yyyy'),
        record.check_in ? format(new Date(record.check_in), 'HH:mm:ss') : '-',
        record.break_start ? format(new Date(record.break_start), 'HH:mm:ss') : '-',
        record.break_end ? format(new Date(record.break_end), 'HH:mm:ss') : '-',
        record.check_out ? format(new Date(record.check_out), 'HH:mm:ss') : '-',
        hoursWorked.toFixed(2),
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers, ...rows].map((row) => row.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `registros-${
        employees.find((emp) => emp.id === selectedEmployee)?.name
      }-${selectedMonth}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Registros de Ponto</h1>
        <ClipboardList className="w-6 h-6 text-blue-600" />
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label htmlFor="employee" className="block text-sm font-medium text-gray-700">
              Funcionário
            </label>
            <select
              id="employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-700">
              Mês
            </label>
            <input
              type="month"
              id="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={exportToCSV}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <p className="text-lg font-medium text-gray-900">
            Total de Horas no Mês: <span className="text-blue-600">{totalHours.toFixed(2)}h</span>
          </p>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                Início Intervalo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fim Intervalo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saída
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horas Trabalhadas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => {
              let hoursWorked = 0;
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

                hoursWorked = Math.round((duration / 60) * 100) / 100;
              }

              return (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(record.date), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.check_in ? format(new Date(record.check_in), 'HH:mm:ss') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.break_start ? format(new Date(record.break_start), 'HH:mm:ss') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.break_end ? format(new Date(record.break_end), 'HH:mm:ss') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.check_out ? format(new Date(record.check_out), 'HH:mm:ss') : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {hoursWorked.toFixed(2)}h
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}