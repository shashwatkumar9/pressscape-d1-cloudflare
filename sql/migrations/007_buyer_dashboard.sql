-- =====================================================
-- Buyer Dashboard Migration
-- Projects, Notifications, Activity Logs, Balance Fields
-- =====================================================

-- Projects table (for organizing buyer orders by campaign/website)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  url VARCHAR(500) NOT NULL,
  description TEXT,
  favicon VARCHAR(500),
  budget_spent INTEGER DEFAULT 0,  -- in cents
  order_count INTEGER DEFAULT 0,
  completed_order_count INTEGER DEFAULT 0,
  last_order_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  link VARCHAR(500),
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  model_type VARCHAR(100),
  model_id TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table (for favorite publishers per project)
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  website_id TEXT NOT NULL REFERENCES websites(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id, website_id)
);

-- Blacklist table (for blocking publishers per project)
CREATE TABLE IF NOT EXISTS blacklists (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  website_id TEXT REFERENCES websites(id) ON DELETE CASCADE,
  domain VARCHAR(255),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add balance fields to users (reserved and bonus)
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_reserved INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS balance_bonus INTEGER DEFAULT 0;

-- Add project_id to orders (optional association)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS project_id TEXT REFERENCES projects(id) ON DELETE SET NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_projects_user_active ON projects(user_id) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_blacklists_user ON blacklists(user_id, project_id);
CREATE INDEX IF NOT EXISTS idx_orders_project ON orders(project_id) WHERE project_id IS NOT NULL;
