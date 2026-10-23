# Supabase Setup Guide for Gujranwala Food Craze

This guide walks you through setting up your Supabase project, executing the SQL migrations, and adding your API keys.

---

## 1. Create a Supabase Project
1. Go to [https://supabase.com](https://supabase.com) and log in or create a free account.
2. Click **New Project**.
3. Choose your organization, set a project name (e.g. `gujranwala-food-craze`), and create a secure database password.
4. Select the region closest to Pakistan (e.g. `Singapore (ap-southeast-1)` or `Mumbai (ap-south-1)`).
5. Click **Create new project**.

---

## 2. Run the SQL Migrations
In the left sidebar of your Supabase dashboard:
1. Click the **SQL Editor** icon (icon looks like `>_` or a terminal).
2. Click **New query** (or `+`).
3. Open and copy the contents of the migration files in this exact order:
   - **Step 1**: Copy all of `backend/supabase/migrations/001_init.sql` into the editor and click **Run** (green button).
   - **Step 2**: Copy all of `backend/supabase/migrations/002_rls.sql` into the editor and click **Run**.
   - **Step 3**: Copy all of `backend/supabase/migrations/003_seed.sql` into the editor and click **Run**.
4. Check **Table Editor** on the left menu: you should now see `reviews` (with 6 seed reviews), `deals` (with 1 active deal), `members_stats` (count: 312), `cta_clicks`, and `admins`.

---

## 3. Retrieve Your Supabase API Keys
In your Supabase project dashboard:
1. Click the **Project Settings** (gear icon at the bottom of the left sidebar).
2. Go to **API** in the settings submenu.
3. You will see:
   - **Project URL** (e.g. `https://xyzcompany.supabase.co`)
   - **Project API keys**:
     - `anon` `public` key (safe for browser)
     - `service_role` `secret` key (Caution: NEVER reveal to frontend; has bypass privileges)

---

## 4. Where to Put Your Keys

### Backend (`backend/.env`)
Put your **Project URL** and the **`service_role` secret key** here:
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJh...your-service-role-secret-key
```

### Frontend (`frontend/.env.local`)
Put your **Project URL** and the **`anon` public key** here (used for Supabase Auth in Phase 5):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WHATSAPP_LINK=https://chat.whatsapp.com/your-invite-code
NEXT_PUBLIC_FOODPANDA_LINK=https://www.foodpanda.pk
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...your-anon-public-key
```

---

## 5. Adding Your Admin User (For Phase 5)
1. Go to **Authentication** > **Users** in your Supabase dashboard and create a user (or sign up via the app).
2. Copy their `User UID`.
3. In SQL Editor, run:
   ```sql
   INSERT INTO public.admins (user_id) 
   VALUES ('paste-your-user-uuid-here');
   ```
This grants access to the `/admin` moderation routes.
