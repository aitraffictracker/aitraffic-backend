-- Optional: only needed if REQUIRE_SITE_REGISTRATION=true
-- If you are self-hosting the app, you don't need to do anything
-- Creates the table that maps site IDs to registered domains.
CREATE TABLE IF NOT EXISTS sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    site_id TEXT UNIQUE NOT NULL,
    domain TEXT NOT NULL,
    user_email TEXT,
    subscription_status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
