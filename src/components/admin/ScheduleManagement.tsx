import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Schedule {
  id: string;
  employee_id: string;
  weekday: string;
  start_time: string;
  end_time: string;
  break_start: string | null;
  break_end: string | null;
}

interface Employee {
  id: string;
  name: string;
}

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  const weekdays = [
    { value: 'monday', label: 'Segunda-feira' },
    { value: 'tuesday', label: 'Terça-feira' },
    { value: 'wednesday', label: 'Quarta-feira' },
    { value: 'thursday', label: 'Quinta-feira' },
    { value: 'friday', label: 'Sexta-feira' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' },
  ];

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployee) {
      fetchSchedules();
    }
  }, [selectedEmployee]);

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, name')
      .eq('user_type', 'employee')
      .eq('active', true)
      .order('name');

    if (data) {
      setEmployees(data);
      if (data.length > 0) {
        setSelectedEmployee(data[0].id);
      }
    }
    setLoading(false);
  };

  const fetchSchedules = async () => {
    const { data } = await supabase
      .from('work_schedules')
      .select('*')
      .eq('employee_id', selectedEmployee);

    if (data) {
      setSchedules(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const scheduleData = {
      employee_id: selectedEmployee,
      weekday: formData.get('weekday'),
      start_time: formData.get('start_time'),
      end_time: formData.get('end_time'),
      break_start: formData.get('break_start') || null,
      break_end: formData.get('break_end') || null,
    };

    if (isEditing && editingSchedule) {
      await supabase
        .from('work_schedules')
        .update(scheduleData)
        .eq('id', editingSchedule.id);
    } else {
      await supabase.from('work_schedules').insert([scheduleData]);
    }

    form.reset();
    setIsEditing(false);
    setEditingSchedule(null);
    await fetchSchedules();
  };

  const handleEdit = (schedule: Schedule) => {
    setIsEditing(true);
    setEditingSchedule(schedule);
  };

  const handleDelete = async (id: string) => {
    await supabase.from('work_schedules').delete().eq('id', id);
    await fetchSchedules();
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Gerenciamento de Horários</h1>
        <Calendar className="w-6 h-6 text-blue-600" />
      </div>

      <div className="mb-6">
        <label htmlFor="employee" className="block text-sm font-medium text-gray-700">
          Selecionar Funcionário
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

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {isEditing ? 'Editar Horário' : 'Adicionar Novo Horário'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="weekday" className="block text-sm font-medium text-gray-700">
              Dia da Semana
            </label>
            <select
              id="weekday"
              name="weekday"
              defaultValue={editingSchedule?.weekday}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              {weekdays.map((day) => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                Horário de Entrada
              </label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                defaultValue={editingSchedule?.start_time}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                Horário de Saída
              </label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                defaultValue={editingSchedule?.end_time}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="break_start" className="block text-sm font-medium text-gray-700">
                Início do Intervalo
              </label>
              <input
                type="time"
                id="break_start"
                name="break_start"
                defaultValue={editingSchedule?.break_start || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="break_end" className="block text-sm font-medium text-gray-700">
                Fim do Intervalo
              </label>
              <input
                type="time"
                id="break_end"
                name="break_end"
                defaultValue={editingSchedule?.break_end || ''}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              {isEditing ? (
                <>
                  <Edit className="w-4 h-4 mr-2" />
                  Atualizar Horário
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Horário
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dia da Semana
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Entrada
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saída
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Intervalo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <tr key={schedule.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {weekdays.find((day) => day.value === schedule.weekday)?.label}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {schedule.start_time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {schedule.end_time}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {schedule.break_start && schedule.break_end
                    ? `${schedule.break_start} - ${schedule.break_end}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(schedule.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}