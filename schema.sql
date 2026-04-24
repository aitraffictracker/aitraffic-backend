CREATE TABLE IF NOT EXISTS events (
    id BIGSERIAL PRIMARY KEY,
    site_id TEXT NOT NULL,
    source TEXT NOT NULL,
    page TEXT NOT NULL,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_site_id_created ON events (site_id, created_at DESC);
