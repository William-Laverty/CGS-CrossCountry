/*
  # Fix RLS Policies for Events and Results

  1. Changes
    - Update RLS policies to allow public access for development
    - This is a temporary solution for development purposes
    - In production, you should implement proper authentication

  2. Security
    - Enable public access to both tables
    - Allow all operations for development
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access to events" ON events;
DROP POLICY IF EXISTS "Allow authenticated users to manage events" ON events;
DROP POLICY IF EXISTS "Allow public read access to results" ON results;
DROP POLICY IF EXISTS "Allow authenticated users to manage results" ON results;

-- Create new policies that allow public access
CREATE POLICY "Enable read access for all users" ON events
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON events
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON events
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON events
  FOR DELETE USING (true);

CREATE POLICY "Enable read access for all users" ON results
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON results
  FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for all users" ON results
  FOR DELETE USING (true);