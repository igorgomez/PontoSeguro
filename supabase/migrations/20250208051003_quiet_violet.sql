/*
  # Correção das políticas RLS para a tabela users

  1. Alterações
    - Remove políticas existentes
    - Adiciona novas políticas sem recursão
    - Permite inserção inicial de usuários
*/

-- Remove as políticas existentes
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Only admins can insert users" ON users;
DROP POLICY IF EXISTS "Only admins can update users" ON users;

-- Adiciona novas políticas
CREATE POLICY "Enable read access for authenticated users"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users"
  ON users FOR UPDATE
  TO authenticated
  USING (true);