-- 001_init.sql: Schema for Gujranwala Food Craze

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(40) NOT NULL CHECK (char_length(trim(name)) >= 2),
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    message VARCHAR(280) NOT NULL CHECK (char_length(trim(message)) >= 5),
    note_color VARCHAR(10) NOT NULL CHECK (note_color IN ('cream', 'amber', 'red')),
    source VARCHAR(50) DEFAULT 'direct',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

-- Index for newest live reviews & cursor pagination
CREATE INDEX IF NOT EXISTS idx_reviews_live_created_at
    ON public.reviews (created_at DESC)
    WHERE deleted_at IS NULL;

-- 2. Deals Table
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price_text VARCHAR(50) NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for active deals query
CREATE INDEX IF NOT EXISTS idx_deals_active 
    ON public.deals (is_active, valid_until DESC);

-- 3. Member Stats Table (Single row)
CREATE TABLE IF NOT EXISTS public.members_stats (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    joined_count INT NOT NULL DEFAULT 312 CHECK (joined_count >= 0),
    display_boost INT NOT NULL DEFAULT 0 CHECK (display_boost >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. CTA Clicks Tracking Table
CREATE TABLE IF NOT EXISTS public.cta_clicks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source VARCHAR(50) NOT NULL DEFAULT 'direct',
    button VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index on clicks for source analytics
CREATE INDEX IF NOT EXISTS idx_cta_clicks_source ON public.cta_clicks (source, created_at DESC);

-- 5. Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Site Settings Table (Single row for dynamic business links)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    whatsapp_link TEXT NOT NULL DEFAULT 'https://chat.whatsapp.com/sample-gfc-invite',
    foodpanda_link TEXT NOT NULL DEFAULT 'https://www.foodpanda.pk',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);
