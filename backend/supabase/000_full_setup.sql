-- 000_full_setup.sql
-- Gujranwala Food Craze: Complete Idempotent Schema and Seed Script
-- Safe to run multiple times in Supabase SQL Editor on a fresh or existing database.

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. TABLES

-- Reviews Table
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

-- Deals Table
CREATE TABLE IF NOT EXISTS public.deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price_text VARCHAR(50) NOT NULL,
    valid_until TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Members Stats Table
CREATE TABLE IF NOT EXISTS public.members_stats (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    joined_count INT NOT NULL DEFAULT 312 CHECK (joined_count >= 0),
    display_boost INT NOT NULL DEFAULT 0 CHECK (display_boost >= 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- CTA Clicks Table
CREATE TABLE IF NOT EXISTS public.cta_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source VARCHAR(50) NOT NULL DEFAULT 'direct',
    button VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Admins Table
CREATE TABLE IF NOT EXISTS public.admins (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Site Settings Table
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    whatsapp_link TEXT NOT NULL DEFAULT 'https://chat.whatsapp.com/B9mYGX1vmzx4OQQjUliwzQ?s=cl&p=a&mlu=4&ilr=4',
    foodpanda_link TEXT NOT NULL DEFAULT 'https://www.foodpanda.pk',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. ROW LEVEL SECURITY (RLS)

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 4. POLICIES (Guarded with DROP POLICY IF EXISTS)

-- Reviews Policies
DROP POLICY IF EXISTS "Deny anon access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public insert to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow public read to live reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow service_role full access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow admins full access to reviews" ON public.reviews;

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

CREATE POLICY "Allow admins full access to reviews"
    ON public.reviews FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- Deals Policies
DROP POLICY IF EXISTS "Deny anon access to deals" ON public.deals;
DROP POLICY IF EXISTS "Allow public read to deals" ON public.deals;
DROP POLICY IF EXISTS "Allow service_role full access to deals" ON public.deals;
DROP POLICY IF EXISTS "Allow admins full access to deals" ON public.deals;

CREATE POLICY "Allow public read to deals"
    ON public.deals FOR SELECT
    USING (true);

CREATE POLICY "Allow service_role full access to deals"
    ON public.deals FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow admins full access to deals"
    ON public.deals FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- Members Stats Policies
DROP POLICY IF EXISTS "Deny anon access to members_stats" ON public.members_stats;
DROP POLICY IF EXISTS "Allow public read to members_stats" ON public.members_stats;
DROP POLICY IF EXISTS "Allow service_role full access to members_stats" ON public.members_stats;
DROP POLICY IF EXISTS "Allow admins full access to members_stats" ON public.members_stats;

CREATE POLICY "Allow public read to members_stats"
    ON public.members_stats FOR SELECT
    USING (true);

CREATE POLICY "Allow service_role full access to members_stats"
    ON public.members_stats FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow admins full access to members_stats"
    ON public.members_stats FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- CTA Clicks Policies
DROP POLICY IF EXISTS "Deny anon access to cta_clicks" ON public.cta_clicks;
DROP POLICY IF EXISTS "Allow public insert to cta_clicks" ON public.cta_clicks;
DROP POLICY IF EXISTS "Allow service_role full access to cta_clicks" ON public.cta_clicks;
DROP POLICY IF EXISTS "Allow admins full access to cta_clicks" ON public.cta_clicks;

CREATE POLICY "Allow public insert to cta_clicks"
    ON public.cta_clicks FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow service_role full access to cta_clicks"
    ON public.cta_clicks FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow admins full access to cta_clicks"
    ON public.cta_clicks FOR SELECT
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- Admins Policies
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

-- Site Settings Policies
DROP POLICY IF EXISTS "Allow public read access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow service_role full access to site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Allow admins full access to site_settings" ON public.site_settings;

CREATE POLICY "Allow public read access to site_settings"
    ON public.site_settings FOR SELECT
    USING (true);

CREATE POLICY "Allow service_role full access to site_settings"
    ON public.site_settings FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow admins full access to site_settings"
    ON public.site_settings FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- 5. GRANTS
GRANT ALL ON TABLE public.reviews TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.deals TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.members_stats TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.cta_clicks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.site_settings TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.admins TO anon, authenticated, service_role;

-- 6. AUTH TOKENS REPAIR (Resolves GoTrue Null Scan Error)
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

-- 7. DEFAULT ADMIN USER REGISTRATION (infoali014@gmail.com)
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

  INSERT INTO public.admins (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

END $$;

-- 8. SEED DATA

-- Member Stats
INSERT INTO public.members_stats (id, joined_count, display_boost, updated_at)
VALUES (1, 312, 0, timezone('utc'::text, now()))
ON CONFLICT (id) DO UPDATE 
SET joined_count = EXCLUDED.joined_count;

-- Site Settings
INSERT INTO public.site_settings (id, whatsapp_link, foodpanda_link, updated_at)
VALUES (1, 'https://chat.whatsapp.com/B9mYGX1vmzx4OQQjUliwzQ?s=cl&p=a&mlu=4&ilr=4', 'https://www.foodpanda.pk', timezone('utc'::text, now()))
ON CONFLICT (id) DO NOTHING;

-- Active Deal
INSERT INTO public.deals (id, title, description, price_text, valid_until, is_active, created_at)
SELECT
    gen_random_uuid(),
    'Craze Special Family Karahi Feast',
    '1KG Special Chicken Karahi + 4 Roghni Naan + Fresh Mint Raita + Salad + 1.5L Chilled Drink',
    'Rs. 1,850 (Save Rs. 450)',
    timezone('utc'::text, now()) + INTERVAL '7 days',
    true,
    timezone('utc'::text, now())
WHERE NOT EXISTS (
    SELECT 1 FROM public.deals WHERE is_active = true
);

-- Seed Reviews (At least 6 reviews, varied colors, zero emojis, zero dashes, clean text)
INSERT INTO public.reviews (name, rating, message, note_color, source, created_at)
SELECT v.name, v.rating, v.message, v.note_color, v.source, v.created_at
FROM (
  VALUES
    (
      'Bilal Butt',
      5,
      'Bhai karahi ka zaiqa kamaal tha! Makhan aur desi mirch ka balance zabardast. WhatsApp group se order kiya tha.',
      'amber',
      'qr',
      timezone('utc'::text, now()) - INTERVAL '2 hours'
    ),
    (
      'Ayesha Tariq',
      5,
      'Best Chicken Makhni Handi in Gujranwala! Garam garam delivery thi and naan bohot soft thay. Recommended!',
      'cream',
      'flyer',
      timezone('utc'::text, now()) - INTERVAL '5 hours'
    ),
    (
      'Hamza Gujjar',
      5,
      'Zabardast taste aur quantity bhi bohat achi thi. Pehle bite se hi pata chal gaya ke ingredients fresh hain.',
      'red',
      'direct',
      timezone('utc'::text, now()) - INTERVAL '1 day'
    ),
    (
      'Usman Sheikh',
      4,
      'Tikka boti was super juicy and smoky. Raita was fresh and packaging bohot neat thi. 10/10 zaiqa!',
      'amber',
      'packaging',
      timezone('utc'::text, now()) - INTERVAL '2 days'
    ),
    (
      'Zainab Malik',
      5,
      'WhatsApp group ka weekly deal bundle mangwaya tha. Pura paisa wasool deal thi! Definitely ordering again.',
      'cream',
      'qr',
      timezone('utc'::text, now()) - INTERVAL '3 days'
    ),
    (
      'Ali Raza',
      5,
      'Asal Punjabi dhaba touch! Khana bilkul fresh aur steaming hot pohncha. Gujranwala mein aisi karahi bohot kam milti hai.',
      'red',
      'flyer',
      timezone('utc'::text, now()) - INTERVAL '4 days'
    )
) AS v(name, rating, message, note_color, source, created_at)
WHERE NOT EXISTS (
  SELECT 1 FROM public.reviews
);
