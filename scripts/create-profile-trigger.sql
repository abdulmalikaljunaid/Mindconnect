-- Migration: Create automatic profile trigger for new users
-- This ensures that when a new user signs up, a profile is automatically created
-- Run this in Supabase SQL Editor if the trigger doesn't exist

-- First, check if the trigger function exists, if not create it
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, is_approved, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1), 'User'),
    COALESCE((NEW.raw_user_meta_data->>'role')::text, 'patient')::role_type,
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role')::text IN ('patient', 'companion') THEN true
      ELSE false
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- Verify the trigger was created
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth'
AND trigger_name = 'on_auth_user_created';


