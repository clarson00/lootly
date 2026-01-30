-- Migration: Add Marketing & Social Posting tables
-- Run with: psql $DATABASE_URL -f db/migrations/add_marketing_tables.sql

-- Add AI addon fields to businesses (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'ai_addon_tier') THEN
        ALTER TABLE businesses ADD COLUMN ai_addon_tier TEXT DEFAULT 'none';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'businesses' AND column_name = 'ai_addon_started_at') THEN
        ALTER TABLE businesses ADD COLUMN ai_addon_started_at TIMESTAMPTZ;
    END IF;
END $$;

-- Social Integrations table
CREATE TABLE IF NOT EXISTS social_integrations (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES businesses(id),
    location_id TEXT REFERENCES locations(id),

    platform TEXT NOT NULL,
    platform_account_id TEXT NOT NULL,
    platform_account_name TEXT,
    platform_page_id TEXT,

    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at TIMESTAMPTZ,
    scopes JSONB,

    is_active BOOLEAN DEFAULT true,
    last_refreshed_at TIMESTAMPTZ,
    last_error_at TIMESTAMPTZ,
    last_error_message TEXT,

    connected_at TIMESTAMPTZ DEFAULT NOW(),
    connected_by TEXT REFERENCES staff(id),
    updated_at TIMESTAMPTZ,

    UNIQUE(business_id, platform, location_id)
);

CREATE INDEX IF NOT EXISTS idx_social_integrations_business ON social_integrations(business_id);

-- Marketing Posts table
CREATE TABLE IF NOT EXISTS marketing_posts (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES businesses(id),
    location_id TEXT REFERENCES locations(id),

    source_type TEXT,
    source_id TEXT,

    content TEXT NOT NULL,
    image_url TEXT,

    platforms JSONB NOT NULL DEFAULT '[]',

    status TEXT DEFAULT 'draft',
    scheduled_at TIMESTAMPTZ,
    published_at TIMESTAMPTZ,

    platform_post_ids JSONB,
    platform_errors JSONB,
    error_message TEXT,

    created_by TEXT REFERENCES staff(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_marketing_posts_business ON marketing_posts(business_id);
CREATE INDEX IF NOT EXISTS idx_marketing_posts_status ON marketing_posts(status);
CREATE INDEX IF NOT EXISTS idx_marketing_posts_scheduled ON marketing_posts(scheduled_at);

-- AI Usage table (for future AI add-on)
CREATE TABLE IF NOT EXISTS ai_usage (
    id TEXT PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES businesses(id),
    staff_id TEXT REFERENCES staff(id),

    feature TEXT NOT NULL,
    action TEXT NOT NULL,
    tokens_used INTEGER,
    prompt_hash TEXT,

    request_context JSONB,
    response_preview TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_business ON ai_usage(business_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON ai_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_feature ON ai_usage(feature);

-- Done!
SELECT 'Marketing tables created successfully!' as result;
