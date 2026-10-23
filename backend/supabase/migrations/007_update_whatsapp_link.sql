-- Migration 007: Update WhatsApp link to the official Gujranwala Food Craze VIP group
UPDATE site_settings
SET whatsapp_link = 'https://chat.whatsapp.com/B9mYGX1vmzx4OQQjUliwzQ?s=cl&p=a&mlu=4&ilr=4',
    updated_at = timezone('utc'::text, now())
WHERE id = 1;

ALTER TABLE site_settings
ALTER COLUMN whatsapp_link SET DEFAULT 'https://chat.whatsapp.com/B9mYGX1vmzx4OQQjUliwzQ?s=cl&p=a&mlu=4&ilr=4';
