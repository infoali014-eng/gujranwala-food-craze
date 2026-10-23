-- 002_rls.sql: Row Level Security Policies
-- Public frontend NEVER talks to Supabase directly. All access goes through the backend API using the service_role key.
-- These RLS policies ensure that if the anon key ever leaks, direct anon access to tables is locked down.

-- Enable RLS on all tables
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cta_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Deny anon access explicitly by default across all tables
-- Note: Service-role key automatically bypasses RLS in Supabase.
-- For maximum defense-in-depth:
CREATE POLICY "Deny anon access to reviews"
    ON public.reviews
    FOR ALL
    TO anon
    USING (false);

CREATE POLICY "Deny anon access to deals"
    ON public.deals
    FOR ALL
    TO anon
    USING (false);

CREATE POLICY "Deny anon access to members_stats"
    ON public.members_stats
    FOR ALL
    TO anon
    USING (false);

CREATE POLICY "Deny anon access to cta_clicks"
    ON public.cta_clicks
    FOR ALL
    TO anon
    USING (false);

CREATE POLICY "Deny anon access to admins"
    ON public.admins
    FOR ALL
    TO anon
    USING (false);

-- Admins table access for authenticated users to check their own role:
CREATE POLICY "Admins can read own admin status"
    ON public.admins
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
