-- Migration 008: Create complaints and suggestions table with strict Row Level Security
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_number TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK (type IN ('complaint', 'suggestion', 'other')),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    order_details TEXT,
    message TEXT NOT NULL,
    source TEXT DEFAULT 'direct',
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    deleted_at TIMESTAMPTZ
);

-- Performance and lookup indexes
CREATE INDEX IF NOT EXISTS idx_complaints_status ON public.complaints (status);
CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON public.complaints (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_complaints_deleted_at ON public.complaints (deleted_at);
CREATE INDEX IF NOT EXISTS idx_complaints_reference ON public.complaints (reference_number);

-- Enable RLS (Strict privacy: phone numbers and messages must never be accessible to the public)
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies
DROP POLICY IF EXISTS "Allow public insert to complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow admins full access to complaints" ON public.complaints;
DROP POLICY IF EXISTS "Allow service_role full access to complaints" ON public.complaints;

-- 1. Public / Anon can ONLY INSERT a complaint. No public SELECT, UPDATE, or DELETE policies exist.
CREATE POLICY "Allow public insert to complaints"
    ON public.complaints FOR INSERT
    TO public, anon
    WITH CHECK (true);

-- 2. Authenticated admins can view, update, and manage all complaints
CREATE POLICY "Allow admins full access to complaints"
    ON public.complaints FOR ALL
    TO authenticated
    USING (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()))
    WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE user_id = auth.uid()));

-- 3. Service role can read and write all complaints (used by Next.js server runtime)
CREATE POLICY "Allow service_role full access to complaints"
    ON public.complaints FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
