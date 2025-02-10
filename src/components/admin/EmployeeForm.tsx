import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const employeeSchema = z.object({
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().length(11, 'CPF deve ter 11 dígitos'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  employee?: {
    id: string;
    name: string;
    cpf: string;
  };
  onSuccess: () => void;
}

export default function EmployeeForm({ employee, onSuccess }: EmployeeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: employee
      ? {
          name: employee.name,
          cpf: employee.cpf,
        }
      : undefined,
  });

  const onSubmit = async (data: EmployeeFormData) => {
    try {
      if (employee) {
        // Update existing employee
        await supabase
          .from('users')
          .update({
            name: data.name,
            ...(data.password ? { password: data.password } : {}),
          })
          .eq('id', employee.id);
      } else {
        // Create new employee
        await supabase.from('users').insert([
          {
            name: data.name,
            cpf: data.cpf,
            password: data.password,
            user_type: 'employee',
            active: true,
          },
        ]);
      }

      reset();
      onSuccess();
    } catch (error) {
      console.error('Error saving employee:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nome Completo
        </label>
        <input
          type="text"
          id="name"
          {...register('name')}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="cpf" className="block text-sm font-medium text-gray-700">
          CPF (apenas números)
        </label>
        <input
          type="text"
          id="cpf"
          {...register('cpf')}
          disabled={!!employee}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
        />
        {errors.cpf && (
          <p className="mt-1 text-sm text-red-600">{errors.cpf.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          {employee ? 'Nova Senha (opcional)' : 'Senha'}
        </label>
        <input
          type="password"
          id="password"
          {...register('password', { required: !employee })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {employee ? (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Alterações
            </>
          ) : (
            <>
              <UserPlus className="w-4 h-4 mr-2" />
              Cadastrar Funcionário
            </>
          )}
        </button>
      </div>
    </form>
  );
}