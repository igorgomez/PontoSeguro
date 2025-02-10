import React, { useState, useEffect } from 'react';
import { UserPlus, Edit, Power } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import EmployeeForm from './EmployeeForm';

interface Employee {
  id: string;
  name: string;
  cpf: string;
  active: boolean;
}

export default function EmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('user_type', 'employee')
      .order('name');

    if (data) {
      setEmployees(data);
    }
    setLoading(false);
  };

  const toggleEmployeeStatus = async (id: string, currentStatus: boolean) => {
    await supabase
      .from('users')
      .update({ active: !currentStatus })
      .eq('id', id);
    
    await fetchEmployees();
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingEmployee(null);
    fetchEmployees();
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Funcionários</h1>
        <button
          onClick={() => {
            setEditingEmployee(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Novo Funcionário
        </button>
      </div>

      {showForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            {editingEmployee ? 'Editar Funcionário' : 'Novo Funcionário'}
          </h2>
          <EmployeeForm
            employee={editingEmployee || undefined}
            onSuccess={handleFormSuccess}
          />
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                CPF
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{employee.cpf}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      employee.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {employee.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => {
                      setEditingEmployee(employee);
                      setShowForm(true);
                    }}
                    className="text-blue-600 hover:text-blue-900 mr-4"
                    title="Editar"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleEmployeeStatus(employee.id, employee.active)}
                    className={`${
                      employee.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                    }`}
                    title={employee.active ? 'Desativar' : 'Ativar'}
                  >
                    <Power className="w-4 h-4" />
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