-- Add is_password_set column to auth_users table
ALTER TABLE auth_users
ADD COLUMN IF NOT EXISTS is_password_set boolean NOT NULL DEFAULT false;

-- Update existing users to have is_password_set = true if they have a password_hash
UPDATE auth_users
SET is_password_set = true
WHERE password_hash IS NOT NULL;

-- Add a check constraint to ensure is_password_set is true when password_hash is set
ALTER TABLE auth_users
ADD CONSTRAINT password_set_check
CHECK (
    (is_password_set = false AND password_hash IS NULL) OR
    (is_password_set = true AND password_hash IS NOT NULL)
);

-- Add an index for performance on commonly queried columns
CREATE INDEX IF NOT EXISTS idx_auth_users_email_password_set
ON auth_users(email, is_password_set);

-- Comment on the new column
COMMENT ON COLUMN auth_users.is_password_set IS 'Indicates whether the user has set their password. False for users created through Stripe who haven''t set up their password yet.';
