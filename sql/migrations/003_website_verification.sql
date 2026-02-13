-- Website Verification System Schema
-- Run this migration to add ownership verification support

-- =====================================================
-- UPDATE WEBSITES TABLE - Add Verification Fields
-- =====================================================

ALTER TABLE websites
ADD COLUMN IF NOT EXISTS ownership_type TEXT DEFAULT 'owner' CHECK (ownership_type IN ('owner', 'contributor')),
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
ADD COLUMN IF NOT EXISTS verification_method TEXT CHECK (verification_method IN ('google_analytics', 'html_file', 'dns_txt', 'admin_approved')),
ADD COLUMN IF NOT EXISTS verification_token TEXT,
ADD COLUMN IF NOT EXISTS contributor_application TEXT,
ADD COLUMN IF NOT EXISTS admin_review_notes TEXT,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reviewed_by TEXT REFERENCES admin_users(id);

-- =====================================================
-- INDEXES FOR VERIFICATION
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_websites_verification_status ON websites(verification_status);
CREATE INDEX IF NOT EXISTS idx_websites_ownership_type ON websites(ownership_type);
CREATE INDEX IF NOT EXISTS idx_websites_pending_verification ON websites(verification_status) WHERE verification_status = 'pending';
