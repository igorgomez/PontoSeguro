import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dzjogfzvqsllbajohuze.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6am9nZnp2cXNsbGJham9odXplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3MTgwNzcsImV4cCI6MjA1NDI5NDA3N30.Lo5zdyYBUGe1RwSqEBUWuvsqa2qOZwJZm1bF_3GMEGw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createInitialUsers() {
  try {
    console.log('Iniciando criação de usuários...');
    
    // Criar usuário administrador
    console.log('Criando usuário administrador...');
    const adminEmail = '00922256403@ponto.local';
    const adminPassword = 'igor1234';
    
    // Primeiro criar o auth user
    const { data: adminAuthData, error: adminAuthError } = await supabase.auth.signUp({
      email: adminEmail,
      password: adminPassword,
      options: {
        data: {
          user_type: 'admin'
        }
      }
    });

    if (adminAuthError || !adminAuthData.user) {
      throw new Error(`Erro ao criar auth do admin: ${adminAuthError?.message}`);
    }

    // Aguardar um momento para garantir que o usuário foi criado
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Inserir admin na tabela users
    const { error: adminError } = await supabase
      .from('users')
      .insert([
        {
          id: adminAuthData.user.id,
          cpf: '00922256403',
          name: 'Administrador',
          password: adminPassword,
          user_type: 'admin',
          active: true
        }
      ]);

    if (adminError) {
      throw new Error(`Erro ao inserir admin na tabela users: ${adminError.message}`);
    }

    console.log('Administrador criado com sucesso');

    // Criar usuário funcionário
    console.log('Criando usuário funcionário...');
    const employeeEmail = '04734223440@ponto.local';
    const employeePassword = 'igor1234';
    
    const { data: employeeAuthData, error: employeeAuthError } = await supabase.auth.signUp({
      email: employeeEmail,
      password: employeePassword,
      options: {
        data: {
          user_type: 'employee'
        }
      }
    });

    if (employeeAuthError || !employeeAuthData.user) {
      throw new Error(`Erro ao criar auth do funcionário: ${employeeAuthError?.message}`);
    }

    // Aguardar um momento para garantir que o usuário foi criado
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Inserir funcionário na tabela users
    const { error: employeeError } = await supabase
      .from('users')
      .insert([
        {
          id: employeeAuthData.user.id,
          cpf: '04734223440',
          name: 'Funcionário',
          password: employeePassword,
          user_type: 'employee',
          active: true
        }
      ]);

    if (employeeError) {
      throw new Error(`Erro ao inserir funcionário na tabela users: ${employeeError.message}`);
    }

    console.log('Funcionário criado com sucesso');
    console.log('Todos os usuários foram criados com sucesso!');
    
  } catch (error) {
    console.error('Erro durante a criação dos usuários:', error);
    throw error;
  }
}

createInitialUsers();