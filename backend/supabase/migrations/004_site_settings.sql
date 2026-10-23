-- 004_site_settings.sql: Site Settings and Business Links for Gujranwala Food Craze

CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    whatsapp_link TEXT NOT NULL DEFAULT 'https://chat.whatsapp.com/sample-gfc-invite',
    foodpanda_link TEXT NOT NULL DEFAULT 'https://www.foodpanda.pk',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access to site_settings (for customers to get latest WhatsApp/Foodpanda links)
CREATE POLICY "Allow public read access to site_settings"
    ON public.site_settings
    FOR SELECT
    USING (true);

-- Allow service_role full access (for backend API)
CREATE POLICY "Allow service_role full access to site_settings"
    ON public.site_settings
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Insert initial default links
INSERT INTO public.site_settings (id, whatsapp_link, foodpanda_link, updated_at)
VALUES (1, 'https://chat.whatsapp.com/sample-gfc-invite', 'https://www.foodpanda.pk', timezone('utc'::text, now()))
ON CONFLICT (id) DO NOTHING;
