-- verify.sql: Verification queries for Gujranwala Food Craze Supabase setup
-- Safe, read-only queries to run in Supabase SQL Editor.

-- 1. Check all 6 tables exist in public schema
SELECT 
    table_name,
    EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = t.table_name
    ) AS table_exists
FROM (
    VALUES 
        ('reviews'),
        ('deals'),
        ('members_stats'),
        ('cta_clicks'),
        ('admins'),
        ('site_settings')
) AS t(table_name);

-- 2. Check Row Level Security (RLS) is enabled on all 6 tables
SELECT 
    c.relname AS table_name,
    c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('reviews', 'deals', 'members_stats', 'cta_clicks', 'admins', 'site_settings')
ORDER BY c.relname;

-- 3. Check active RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('reviews', 'deals', 'members_stats', 'cta_clicks', 'admins', 'site_settings')
ORDER BY tablename, policyname;

-- 4. Check review count (must be at least 6 live reviews)
SELECT 
    COUNT(*) AS total_reviews,
    COUNT(*) FILTER (WHERE deleted_at IS NULL) AS live_reviews,
    COUNT(*) FILTER (WHERE deleted_at IS NOT NULL) AS deleted_reviews,
    (COUNT(*) FILTER (WHERE deleted_at IS NULL) >= 6) AS has_minimum_6_reviews
FROM public.reviews;

-- 5. Check admin user status
SELECT 
    a.user_id,
    u.email,
    u.email_confirmed_at IS NOT NULL AS email_confirmed,
    a.created_at AS admin_since
FROM public.admins a
JOIN auth.users u ON a.user_id = u.id;

-- 6. Check deals and settings initialization
SELECT 
    (SELECT COUNT(*) FROM public.deals WHERE is_active = true) AS active_deals_count,
    (SELECT joined_count FROM public.members_stats WHERE id = 1) AS current_member_count,
    (SELECT whatsapp_link FROM public.site_settings WHERE id = 1) AS whatsapp_link;
