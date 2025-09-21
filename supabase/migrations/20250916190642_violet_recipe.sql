/*
# QR Session Management

1. New Tables
  - `qr_sessions`
    - `id` (uuid, primary key)
    - `user_id` (uuid, foreign key to users)
    - `session_id` (text, unique session identifier)
    - `phone_number` (text, user's phone number)
    - `amount` (decimal, optional pre-filled amount)
    - `type` (enum: send, receive)
    - `expires_at` (timestamp, session expiration)
    - `used_at` (timestamp, when session was used)
    - `created_at` (timestamp)

2. Security
  - Enable RLS on `qr_sessions` table
  - Add policies for users to manage their own sessions
*/

-- Create enum type for QR session types
CREATE TYPE qr_session_type AS ENUM ('send', 'receive');

CREATE TABLE IF NOT EXISTS qr_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  session_id text UNIQUE NOT NULL,
  phone_number text NOT NULL,
  amount decimal(10, 2),
  type qr_session_type NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_qr_sessions_user_id ON qr_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_session_id ON qr_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_qr_sessions_expires_at ON qr_sessions(expires_at);

ALTER TABLE qr_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own QR sessions"
  ON qr_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own QR sessions"
  ON qr_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own QR sessions"
  ON qr_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_qr_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM qr_sessions 
  WHERE expires_at < now() 
    AND used_at IS NULL;
END;
$$ LANGUAGE plpgsql;