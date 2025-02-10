/*
  # Initial Schema Setup for Time Tracking System

  1. New Tables
    - users
      - id (uuid, primary key)
      - cpf (text, unique)
      - name (text)
      - password (text)
      - user_type (text)
      - active (boolean)
      - created_at (timestamp)
      - last_login (timestamp)
    
    - work_schedules
      - id (uuid, primary key)
      - employee_id (uuid, foreign key)
      - weekday (text)
      - start_time (time)
      - end_time (time)
      - break_start (time)
      - break_end (time)
      - created_at (timestamp)
    
    - time_records
      - id (uuid, primary key)
      - employee_id (uuid, foreign key)
      - date (date)
      - check_in (timestamp)
      - break_start (timestamp)
      - break_end (timestamp)
      - check_out (timestamp)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Users table
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cpf text UNIQUE NOT NULL,
  name text NOT NULL,
  password text NOT NULL,
  user_type text NOT NULL CHECK (user_type IN ('admin', 'employee')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

-- Work schedules table
CREATE TABLE work_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  weekday text NOT NULL CHECK (weekday IN ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday')),
  start_time time NOT NULL,
  end_time time NOT NULL,
  break_start time,
  break_end time,
  created_at timestamptz DEFAULT now(),
  UNIQUE(employee_id, weekday)
);

-- Time records table
CREATE TABLE time_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id uuid REFERENCES users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  check_in timestamptz,
  break_start timestamptz,
  break_end timestamptz,
  check_out timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_records ENABLE ROW LEVEL SECURITY;

-- Policies for users table
CREATE POLICY "Users can view their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR 
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can insert users"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can update users"
  ON users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Policies for work_schedules table
CREATE POLICY "Users can view their own schedules"
  ON work_schedules
  FOR SELECT
  TO authenticated
  USING (
    employee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Only admins can manage schedules"
  ON work_schedules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

-- Policies for time_records table
CREATE POLICY "Users can view their own time records"
  ON time_records
  FOR SELECT
  TO authenticated
  USING (
    employee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Users can insert their own time records"
  ON time_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    employee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );

CREATE POLICY "Users can update their own time records"
  ON time_records
  FOR UPDATE
  TO authenticated
  USING (
    employee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND user_type = 'admin'
    )
  );