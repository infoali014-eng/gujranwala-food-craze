-- 005_admin_and_settings.sql: Site Settings Table & Admin User Provisioning

-- 1. Ensure required extensions are enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Site Settings Table (Dynamic Business Links)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    whatsapp_link TEXT NOT NULL DEFAULT 'https://chat.whatsapp.com/sample-gfc-invite',
    foodpanda_link TEXT NOT NULL DEFAULT 'https://www.foodpanda.pk',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Enable RLS and Configure Access Policies
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'site_settings' 
        AND policyname = 'Allow public read access to site_settings'
    ) THEN
        CREATE POLICY "Allow public read access to site_settings"
            ON public.site_settings FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'site_settings' 
        AND policyname = 'Allow service_role full access to site_settings'
    ) THEN
        CREATE POLICY "Allow service_role full access to site_settings"
            ON public.site_settings FOR ALL TO service_role USING (true) WITH CHECK (true);
    END IF;
END $$;

-- 4. Insert Default Site Settings Row
INSERT INTO public.site_settings (id, whatsapp_link, foodpanda_link, updated_at)
VALUES (1, 'https://chat.whatsapp.com/sample-gfc-invite', 'https://www.foodpanda.pk', timezone('utc'::text, now()))
ON CONFLICT (id) DO NOTHING;

-- 5. Create or Update Admin User & Grant Admin Role
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Check if user already exists in Supabase Auth
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'infoali014@gmail.com';

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();

    -- Create user in auth.users
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
      updated_at
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
      now()
    );

    -- Create identity record for Supabase email provider
    BEGIN
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
    EXCEPTION WHEN OTHERS THEN
      NULL;
    END;

  ELSE
    -- If user already exists, update their password and confirm email
    UPDATE auth.users
    SET encrypted_password = crypt('Alishair123?', gen_salt('bf')),
        email_confirmed_at = COALESCE(email_confirmed_at, now()),
        updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- Grant access in public.admins table
  INSERT INTO public.admins (user_id)
  VALUES (v_user_id)
  ON CONFLICT (user_id) DO NOTHING;

END $$;
