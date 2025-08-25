-- Update the existing profiles table to add the email column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT NOT NULL DEFAULT '';
    END IF;
END $$;

-- Insert existing users into profiles table (for users that already exist)
INSERT INTO public.profiles (id, email, full_name)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data ->> 'full_name'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL AND au.email IS NOT NULL
ON CONFLICT (id) DO UPDATE SET 
  email = EXCLUDED.email,
  full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);