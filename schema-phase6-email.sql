-- Add email column to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Backfill existing emails from auth.users (requires superuser/postgres access if run in SQL Editor)
UPDATE user_profiles up
SET email = au.email
FROM auth.users au
WHERE up.id = au.id;

-- Update the trigger function so new users get their email copied automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, full_name, avatar_url, role, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'username', 'user_' || substr(new.id::text, 1, 8)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'buyer',
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
