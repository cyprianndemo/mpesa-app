/*
# Transaction Management System

1. New Tables
  - `transactions`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to users)
    - `type` (enum: sent, received, bills, airtime, withdraw)
    - `amount` (decimal, transaction amount)
    - `phone_number` (text, recipient/sender phone)
    - `description` (text, transaction description)
    - `status` (enum: completed, pending, failed)
    - `mpesa_receipt` (text, M-Pesa transaction ID)
    - `created_at` (timestamp)
    - `updated_at` (timestamp)

2. Security
  - Enable RLS on `transactions` table
  - Add policies for users to access their own transactions
*/

-- Create enum types
CREATE TYPE transaction_type AS ENUM ('sent', 'received', 'bills', 'airtime', 'withdraw');
CREATE TYPE transaction_status AS ENUM ('completed', 'pending', 'failed');

CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  type transaction_type NOT NULL,
  amount decimal(10, 2) NOT NULL,
  phone_number text,
  description text NOT NULL,
  status transaction_status DEFAULT 'pending',
  mpesa_receipt text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
  ON transactions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own transactions"
  ON transactions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());