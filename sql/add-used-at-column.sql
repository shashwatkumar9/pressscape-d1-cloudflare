-- Add used_at column to password_reset_tokens table
-- This column tracks when a reset token was used to prevent reuse

ALTER TABLE password_reset_tokens ADD COLUMN used_at TEXT;
