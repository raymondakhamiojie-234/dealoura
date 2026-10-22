-- ==========================================
-- DEALOURA: PROMOTE ACCOUNT TO ADMINISTRATOR
-- ==========================================

-- Replace 'your_email@example.com' with the email address of your Dealoura account:
UPDATE user_profiles
SET role = 'admin'
WHERE email = 'your_email@example.com';

-- Alternatively, promote by username:
-- UPDATE user_profiles
-- SET role = 'admin'
-- WHERE username = 'your_username';

-- Check all current administrators:
SELECT id, username, email, role, created_at
FROM user_profiles
WHERE role = 'admin';
