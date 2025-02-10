import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

export default function TimeClockCard() {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    fetchTodayRecord();
    return () => clearInterval(timer);
  }, []);

  const fetchTodayRecord = async () => {
    const { data } = await supabase
      .from('time_records')
      .select('*')
      .eq('employee_id', user?.id)
      .eq('date', format(new Date(), 'yyyy-MM-dd'))
      .single();

    setTodayRecord(data);
  };

  const handleTimeRecord = async (type: 'check_in' | 'break_start' | 'break_end' | 'check_out') => {
    setLoading(true);
    try {
      if (!todayRecord) {
        await supabase
          .from('time_records')
          .insert([
            {
              employee_id: user?.id,
              [type]: new Date().toISOString(),
            },
          ]);
      } else {
        await supabase
          .from('time_records')
          .update({ [type]: new Date().toISOString() })
          .eq('id', todayRecord.id);
      }
      await fetchTodayRecord();
    } catch (error) {
      console.error('Error recording time:', error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Registro de Ponto</h2>
        <Clock className="w-6 h-6 text-blue-600" />
      </div>

      <div className="text-center mb-8">
        <p className="text-sm text-gray-600">
          {format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR })}
        </p>
        <p className="text-4xl font-bold text-gray-800 mt-2">
          {format(currentTime, 'HH:mm:ss')}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleTimeRecord('check_in')}
          disabled={loading || todayRecord?.check_in}
          className="p-3 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
        >
          Entrada
        </button>
        <button
          onClick={() => handleTimeRecord('break_start')}
          disabled={loading || !todayRecord?.check_in || todayRecord?.break_start}
          className="p-3 text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400"
        >
          Início Intervalo
        </button>
        <button
          onClick={() => handleTimeRecord('break_end')}
          disabled={loading || !todayRecord?.break_start || todayRecord?.break_end}
          className="p-3 text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400"
        >
          Fim Intervalo
        </button>
        <button
          onClick={() => handleTimeRecord('check_out')}
          disabled={loading || !todayRecord?.check_in || todayRecord?.check_out}
          className="p-3 text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400"
        >
          Saída
        </button>
      </div>

      {todayRecord && (
        <div className="mt-6 space-y-2 text-sm text-gray-600">
          {todayRecord.check_in && (
            <p>Entrada: {format(new Date(todayRecord.check_in), 'HH:mm:ss')}</p>
          )}
          {todayRecord.break_start && (
            <p>Início Intervalo: {format(new Date(todayRecord.break_start), 'HH:mm:ss')}</p>
          )}
          {todayRecord.break_end && (
            <p>Fim Intervalo: {format(new Date(todayRecord.break_end), 'HH:mm:ss')}</p>
          )}
          {todayRecord.check_out && (
            <p>Saída: {format(new Date(todayRecord.check_out), 'HH:mm:ss')}</p>
          )}
        </div>
      )}
    </div>
  );
}