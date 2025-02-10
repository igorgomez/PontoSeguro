/*
  # Adicionar usuários iniciais

  1. Novos Registros
    - Adiciona um usuário administrador
    - Adiciona um usuário funcionário
  
  2. Alterações
    - Remove a restrição NOT NULL da coluna password, pois não é mais necessária
*/

-- Remover a restrição NOT NULL da coluna password
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

-- Inserir usuário administrador
INSERT INTO users (cpf, name, user_type, active)
VALUES (
  '00922256403',
  'Administrador',
  'admin',
  true
)
ON CONFLICT (cpf) DO NOTHING;

-- Inserir usuário funcionário
INSERT INTO users (cpf, name, user_type, active)
VALUES (
  '04734223440',
  'Funcionário',
  'employee',
  true
)
ON CONFLICT (cpf) DO NOTHING;