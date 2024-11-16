-- Rename the table for clarity
ALTER TABLE IF EXISTS resumes 
RENAME TO user_base_resumes;

-- Recreate the constraint with the new name
ALTER TABLE user_base_resumes
ADD CONSTRAINT user_base_resumes_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- Create the table structure if it doesn't exist
CREATE TABLE IF NOT EXISTS user_base_resumes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_name VARCHAR(255) NOT NULL,
    resume_content TEXT NOT NULL,
    file_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_default BOOLEAN DEFAULT false
);
