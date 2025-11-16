/*
  # Create Orvion Digital Business Card Schema

  ## Overview
  This migration sets up the complete database schema for the Orvion digital business card system,
  including user profiles and business cards with full contact information.

  ## New Tables
  
  ### `profiles`
  User profile information linked to Supabase auth
  - `id` (uuid, primary key) - References auth.users.id
  - `email` (text, not null) - User's email address
  - `full_name` (text) - User's full name
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `business_cards`
  Digital business card information
  - `id` (uuid, primary key) - Unique card identifier
  - `user_id` (uuid, not null) - References profiles.id
  - `slug` (text, unique, not null) - URL-friendly identifier (e.g., 'john-doe')
  - `full_name` (text, not null) - Card holder's full name
  - `title` (text) - Job title or position
  - `company` (text) - Company name
  - `email` (text) - Business email
  - `phone` (text) - Phone number
  - `website` (text) - Website URL
  - `address` (text) - Physical address
  - `bio` (text) - Short biography or description
  - `avatar_url` (text) - Profile image URL
  - `is_active` (boolean) - Card active status
  - `created_at` (timestamptz) - Card creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  - Enable RLS on all tables
  - `profiles`: Users can read and update their own profile
  - `business_cards`: 
    - Public read access to active cards
    - Users can manage their own cards (create, read, update, delete)
  
  ## Notes
  1. Slugs must be unique across all business cards for URL routing
  2. Only active cards are publicly accessible
  3. Users can create multiple business cards
  4. Profile is automatically created on user registration
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create business_cards table
CREATE TABLE IF NOT EXISTS business_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  slug text UNIQUE NOT NULL,
  full_name text NOT NULL,
  title text,
  company text,
  email text,
  phone text,
  website text,
  address text,
  bio text,
  avatar_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_business_cards_user_id ON business_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_business_cards_slug ON business_cards(slug);
CREATE INDEX IF NOT EXISTS idx_business_cards_is_active ON business_cards(is_active);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_cards ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Business cards policies
CREATE POLICY "Public can view active cards"
  ON business_cards FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Users can view own cards"
  ON business_cards FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own cards"
  ON business_cards FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cards"
  ON business_cards FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own cards"
  ON business_cards FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_cards_updated_at
  BEFORE UPDATE ON business_cards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();