-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create auth_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.auth_users (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    is_password_set boolean NOT NULL DEFAULT false,
    is_verified boolean NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security for auth_users
ALTER TABLE public.auth_users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to read only their own data
CREATE POLICY "Users can view their own data"
    ON public.auth_users
    FOR SELECT
    USING (auth.uid() = id);

-- Create policy to allow users to update their own data
CREATE POLICY "Users can update their own data"
    ON public.auth_users
    FOR UPDATE
    USING (auth.uid() = id);

-- Add index for email lookups
CREATE INDEX IF NOT EXISTS idx_auth_users_email
    ON public.auth_users(email);

-- Add index for password status checks
CREATE INDEX IF NOT EXISTS idx_auth_users_email_password_set
    ON public.auth_users(email, is_password_set);

-- Create the user_credits table
create table if not exists public.user_credits (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth_users(id) not null unique,
    credits_remaining integer not null default 10,
    total_optimizations integer not null default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.user_credits enable row level security;

-- Update the default value for credits_remaining
ALTER TABLE public.user_credits 
ALTER COLUMN credits_remaining SET DEFAULT 10;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own credits" ON public.user_credits;
DROP POLICY IF EXISTS "Users can update their own credits" ON public.user_credits;

-- Create policy to allow users to read only their own credits
CREATE POLICY "Users can view their own credits"
    ON public.user_credits
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow the application to update user credits
CREATE POLICY "Users can update their own credits"
    ON public.user_credits
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Function to automatically create credits for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.user_credits (user_id, credits_remaining)
    VALUES (new.id, 10);
    RETURN new;
END;
$$;

-- Trigger to call handle_new_user() when a new user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth_users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth_users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Update existing users to have 10 credits if they have less
UPDATE public.user_credits 
SET credits_remaining = 10 
WHERE credits_remaining < 10;
