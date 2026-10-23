-- 003_seed.sql: Initial Seed Data for Gujranwala Food Craze

-- 1. Insert Initial Member Stats
INSERT INTO public.members_stats (id, joined_count, display_boost, updated_at)
VALUES (1, 312, 0, timezone('utc'::text, now()))
ON CONFLICT (id) DO UPDATE 
SET joined_count = EXCLUDED.joined_count;

-- 2. Insert Active Weekly Deal
INSERT INTO public.deals (id, title, description, price_text, valid_until, is_active, created_at)
VALUES (
    uuid_generate_v4(),
    'Craze Special Family Karahi Feast',
    '1KG Special Chicken Karahi + 4 Roghni Naan + Fresh Mint Raita + Salad + 1.5L Chilled Drink',
    'Rs. 1,850 (Save Rs. 450)',
    timezone('utc'::text, now()) + INTERVAL '7 days',
    true,
    timezone('utc'::text, now())
);

-- 3. Insert 6 Sample Reviews (Roman Urdu & English, varied note colors)
INSERT INTO public.reviews (name, rating, message, note_color, source, created_at)
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
);
