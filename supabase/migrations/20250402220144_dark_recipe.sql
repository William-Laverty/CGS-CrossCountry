/*
  # Cross Country Event Schema

  1. New Tables
    - `events`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
      - `active` (boolean)
    - `results`
      - `id` (uuid, primary key)
      - `event_id` (uuid, foreign key)
      - `runner_name` (text)
      - `house` (text)
      - `time` (interval)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage events and results
*/

CREATE TABLE events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  active boolean DEFAULT true
);

CREATE TABLE results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  runner_name text NOT NULL,
  house text NOT NULL,
  time interval NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to events"
  ON events
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage events"
  ON events
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public read access to results"
  ON results
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to manage results"
  ON results
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);