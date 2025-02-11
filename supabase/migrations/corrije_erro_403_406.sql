/*
  # Correção das políticas de RLS

  1. Alterações
    - Simplificação das políticas de RLS para work_schedules
    - Simplificação das políticas de RLS para time_records
    - Remoção de políticas conflitantes
    - Adição de novas políticas mais permissivas

  2. Segurança
    - Mantém a segurança básica permitindo acesso apenas a usuários autenticados
    - Permite que administradores acessem todos os registros
    - Permite que funcionários acessem seus próprios registros
*/

-- Remove as políticas existentes de work_schedules
DROP POLICY IF EXISTS "Users can view their own schedules" ON work_schedules;
DROP POLICY IF EXISTS "Only admins can manage schedules" ON work_schedules;

-- Remove as políticas existentes de time_records
DROP POLICY IF EXISTS "Users can view their own time records" ON time_records;
DROP POLICY IF EXISTS "Users can insert their own time records" ON time_records;
DROP POLICY IF EXISTS "Users can update their own time records" ON time_records;

-- Novas políticas para work_schedules
CREATE POLICY "Users can view their own schedules" ON work_schedules
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all schedules" ON work_schedules
  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));

-- Novas políticas para time_records
CREATE POLICY "Users can view their own time records" ON time_records
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own time records" ON time_records
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own time records" ON time_records
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all time records" ON time_records
  FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'));