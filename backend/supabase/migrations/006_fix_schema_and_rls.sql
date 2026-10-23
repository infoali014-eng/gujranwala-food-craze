-- 006_fix_schema_and_rls.sql: Fix Supabase Auth Schema & RLS Policies
-- Run this script in your Supabase SQL Editor to resolve:
-- 1) "Database error querying schema" on admin login
-- 2) RLS permission errors when inserting reviews/notes

-- ============================================================================
-- PART 1: FIX NULL TOKEN COLUMNS IN auth.users (Resolves GoTrue Scan Error)
-- ============================================================================

UPDATE auth.users
SET 
  confirmation_token = COALESCE(confirmation_token, ''),
  recovery_token = COALESCE(recovery_token, ''),
  email_change_token_new = COALESCE(email_change_token_new, ''),
  email_change = COALESCE(email_change, ''),
  email_change_token_current = COALESCE(email_change_token_current, ''),
  phone_change = COALESCE(phone_change, ''),
  phone_change_token = COALESCE(phone_change_token, ''),
  reauthentication_token = COALESCE(reauthentication_token, ''),
  phone = COALESCE(phone, '')
WHERE confirmation_token IS NULL 
   OR recovery_token IS NULL 
   OR email_change_token_new IS NULL 
   OR email_change IS NULL;

-- Ensure admin user exists with valid hash and auto-confirmed email
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'infoali014@gmail.com';

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      email_change_token_new,
      email_change,
      email_change_token_current,
      phone_change,
      phone_change_token,
      reauthentication_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'infoali014@gmail.com',
      crypt('Alishair123?', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      ''
    );

    -- Insert identity record
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      provider_id,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      v_user_id,
      format('{"sub":"%s","email":"%s"}', v_user_id::text, 'infoali014@gmail.com')::jsonb,
      'email',
      v_user_id::text,
      now(),
      now(),
      now()
    );

  ELSE
    -- Update existing admin user with confirmed email, fresh password, and empty tokens
    UPDATE auth.users
    SET 
      encrypted_password = crypt('Alishair123?', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      updated_at = now(),
      confirmation_token = '',
      recovery_token = '',
      email_change_token_new = '',
      email_change = '',
      email_change_token_current = '',
      phone_change = '',
      phone_change_token = '',
      reauthentication_token = ''
    WHERE id = v_user_id;

    -- Ensure identity exists
    IF NOT EXISTS (SELECT 1 FROM auth.identities WHERE user_id = v_user_id) THEN
      INSERT INTO auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        v_user_id,
        format('{"sub":"%s","email":"%s"}', v_user_id::text, 'infoali014@gmail.com')::jsonb,
        'email',
        v_user_id::text,
        now(),
        now(),
        now()
      );
    END IF;
  END IF;

  -- Ensure public.admins record exists
  CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
  );

  INSERT INTO public.admins (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

END $$;


-- ============================================================================
-- PART 2: ENSURE TABLES & ROW LEVEL SECURITY POLICIES FOR REVIEWS & SITE
-- ============================================================================

-- 1. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(40) NOT NULL CHECK (char_length(trim(name)) >= 2),
    rating SMALLINT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    message VARCHAR(280) NOT NULL CHECK (char_length(trim(message)) >= 5),
    note_color VARCHAR(10) NOT NULL CHECK (note_color IN ('cream', 'amber', 'red')),
    source VARCHAR(50) DEFAULT 'direct',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ DEFAULT NULL
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Drop any restrictive conflicting policies
DROP POLICY IF EXISTS "Deny anon access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public insert to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public read to live reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow service_role full access to reviews" ON public.reviews;

-- Create open insert & read policies for reviews
CREATE POLICY "Allow public insert to reviews"
    ON public.reviews FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow public read to live reviews"
    ON public.reviews FOR SELECT
    USING (deleted_at IS NULL);

CREATE POLICY "Allow service_role full access to reviews"
    ON public.reviews FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 2. CTA Clicks Table
CREATE TABLE IF NOT EXISTS public.cta_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(50) NOT NULL DEFAULT 'direct',
    button VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.cta_clicks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny anon access to cta_clicks" ON public.cta_clicks;
DROP POLICY IF EXISTS "Allow public insert to cta_clicks" ON public.cta_clicks;
DROP POLICY IF EXISTS "Allow service_role full access to cta_clicks" ON public.cta_clicks;

CREATE POLICY "Allow public insert to cta_clicks"
    ON public.cta_clicks FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow service_role full access to cta_clicks"
    ON public.cta_clicks FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. Deals Table
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price_text VARCHAR(50) NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny anon access to deals" ON public.deals;
DROP POLICY IF EXISTS "Allow public read to deals" ON public.deals;
DROP POLICY IF EXISTS "Allow service_role full access to deals" ON public.deals;

CREATE POLICY "Allow public read to deals"
    ON public.deals FOR SELECT
    USING (true);

CREATE POLICY "Allow service_role full access to deals"
    ON public.deals FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. Members Stats Table
CREATE TABLE IF NOT EXISTS public.members_stats (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    joined_count INT NOT NULL DEFAULT 312 CHECK (joined_count >= 0),
    display_boost INT NOT NULL DEFAULT 0 CHECK (display_boost >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.members_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny anon access to members_stats" ON public.members_stats;
DROP POLICY IF EXISTS "Allow public read to members_stats" ON public.members_stats;
DROP POLICY IF EXISTS "Allow service_role full access to members_stats" ON public.members_stats;

CREATE POLICY "Allow public read to members_stats"
    ON public.members_stats FOR SELECT
    USING (true);

CREATE POLICY "Allow service_role full access to members_stats"
    ON public.members_stats FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

INSERT INTO public.members_stats (id, joined_count, display_boost, updated_at)
VALUES (1, 312, 0, timezone('utc'::text, now()))
ON CONFLICT (id) DO NOTHING;

-- 5. Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    whatsapp_link TEXT NOT NULL DEFAULT 'https://chat.whatsapp.com/sample-gfc-invite',
    foodpanda_link TEXT NOT NULL DEFAULT 'https://www.foodpanda.pk',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow service_role full access to site_settings" ON public.site_settings;

CREATE POLICY "Allow public read access to site_settings"
    ON public.site_settings FOR SELECT
    USING (true);

CREATE POLICY "Allow service_role full access to site_settings"
    ON public.site_settings FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

INSERT INTO public.site_settings (id, whatsapp_link, foodpanda_link, updated_at)
VALUES (1, 'https://chat.whatsapp.com/sample-gfc-invite', 'https://www.foodpanda.pk', timezone('utc'::text, now()))
ON CONFLICT (id) DO NOTHING;

-- 6. Admins Table RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Deny anon access to admins" ON public.admins;
DROP POLICY IF EXISTS "Allow service_role full access to admins" ON public.admins;
DROP POLICY IF EXISTS "Admins can read own admin status" ON public.admins;

CREATE POLICY "Allow service_role full access to admins"
    ON public.admins FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Admins can read own admin status"
    ON public.admins FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- ============================================================================
-- PART 3: GRANT TABLE PERMISSIONS
-- ============================================================================
GRANT ALL ON TABLE public.reviews TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.deals TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.members_stats TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.cta_clicks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.site_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.admins TO anon, authenticated, service_role;
