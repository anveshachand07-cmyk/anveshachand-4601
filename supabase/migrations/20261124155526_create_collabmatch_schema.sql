/*
# CollabMatch: creators, campaigns, and applications

## Overview
Two-sided influencer & brand collaboration marketplace. Single-tenant (no auth).
Creators build a media kit (auto-tiered), browse matching campaigns, and apply.
Brands post campaigns and approve/reject matched applicants.

## Tier Logic (applied in app code, stored on row)
- Nano: 500–10k followers
- Micro: 10k–100k followers
- Mid: 100k–500k followers
- Macro: 500k+ followers
- Engagement rate = (avg_likes / followers) * 100
- If engagement_rate > 8%, creator is unlocked for higher-tier campaigns

## New Tables
1. `creators`
   - id (uuid PK)
   - handle (text, unique)
   - niche (text)
   - followers (integer)
   - avg_views (integer)
   - avg_likes (integer)
   - engagement_rate (numeric, computed by app)
   - tier (text, computed by app)
   - bio (text)
   - avatar_url (text)
   - created_at (timestamptz)

2. `campaigns`
   - id (uuid PK)
   - title (text)
   - brand_name (text)
   - niche (text)
   - description (text)
   - budget (numeric)
   - collab_type (text: 'Barter' | 'Paid' | 'Affiliate')
   - target_tier (text: 'Nano' | 'Micro' | 'Mid' | 'Macro')
   - min_engagement_rate (numeric)
   - status (text, default 'Active')
   - created_at (timestamptz)

3. `applications`
   - id (uuid PK)
   - creator_id (uuid FK -> creators)
   - campaign_id (uuid FK -> campaigns)
   - pitch (text)
   - rate_estimate (numeric)
   - status (text: 'Applied' | 'Approved' | 'Content Live' | 'Paid')
   - created_at (timestamptz)

## Security
- Single-tenant no-auth app. RLS enabled on all tables.
- CRUD granted to anon + authenticated (intentionally public/shared data).
- 4 policies per table (select/insert/update/delete), all USING/WITH CHECK (true).

## Seed Data
- 5 sample creators across different tiers and niches
- 5 sample campaigns across different tiers and niches
*/

-- ===== CREATORS =====
CREATE TABLE IF NOT EXISTS creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text UNIQUE NOT NULL,
  niche text NOT NULL,
  followers integer NOT NULL,
  avg_views integer NOT NULL DEFAULT 0,
  avg_likes integer NOT NULL DEFAULT 0,
  engagement_rate numeric NOT NULL DEFAULT 0,
  tier text NOT NULL,
  bio text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON creators TO anon, authenticated;

DROP POLICY IF EXISTS "creators_select_all" ON creators;
CREATE POLICY "creators_select_all" ON creators FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "creators_insert_all" ON creators;
CREATE POLICY "creators_insert_all" ON creators FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "creators_update_all" ON creators;
CREATE POLICY "creators_update_all" ON creators FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "creators_delete_all" ON creators;
CREATE POLICY "creators_delete_all" ON creators FOR DELETE
TO anon, authenticated USING (true);

-- ===== CAMPAIGNS =====
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  brand_name text NOT NULL,
  niche text NOT NULL,
  description text DEFAULT '',
  budget numeric NOT NULL DEFAULT 0,
  collab_type text NOT NULL DEFAULT 'Paid',
  target_tier text NOT NULL DEFAULT 'Micro',
  min_engagement_rate numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON campaigns TO anon, authenticated;

DROP POLICY IF EXISTS "campaigns_select_all" ON campaigns;
CREATE POLICY "campaigns_select_all" ON campaigns FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "campaigns_insert_all" ON campaigns;
CREATE POLICY "campaigns_insert_all" ON campaigns FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "campaigns_update_all" ON campaigns;
CREATE POLICY "campaigns_update_all" ON campaigns FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "campaigns_delete_all" ON campaigns;
CREATE POLICY "campaigns_delete_all" ON campaigns FOR DELETE
TO anon, authenticated USING (true);

-- ===== APPLICATIONS =====
CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  pitch text NOT NULL DEFAULT '',
  rate_estimate numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Applied',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON applications TO anon, authenticated;

DROP POLICY IF EXISTS "applications_select_all" ON applications;
CREATE POLICY "applications_select_all" ON applications FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "applications_insert_all" ON applications;
CREATE POLICY "applications_insert_all" ON applications FOR INSERT
TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "applications_update_all" ON applications;
CREATE POLICY "applications_update_all" ON applications FOR UPDATE
TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "applications_delete_all" ON applications;
CREATE POLICY "applications_delete_all" ON applications FOR DELETE
TO anon, authenticated USING (true);

-- ===== SEED DATA =====

-- 5 sample creators (engagement_rate = round(avg_likes / followers * 100, 1))
INSERT INTO creators (handle, niche, followers, avg_views, avg_likes, engagement_rate, tier, bio, avatar_url) VALUES
('@fitwithlena', 'Fitness', 8500, 4200, 720, 8.5, 'Nano', 'Certified personal trainer sharing home workout routines and nutrition tips.', 'https://images.pexels.com/photos/3768916/pexels-photo-3768916.jpeg?auto=compress&cs=tinysrgb&w=400'),
('@techbyjordan', 'Tech', 45000, 28000, 2700, 6.0, 'Micro', 'Gadget reviewer and software dev breaking down the latest tech in plain English.', 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400'),
('@wanderlust.mia', 'Travel', 220000, 120000, 11000, 5.0, 'Mid', 'Solo traveler documenting hidden gems across 40+ countries.', 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400'),
('@glowbysophie', 'Beauty', 750000, 350000, 37500, 5.0, 'Macro', 'Celebrity makeup artist and skincare educator. 10 years in the industry.', 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400'),
('@eatswithdev', 'Food', 32000, 18000, 4800, 15.0, 'Micro', 'Street food explorer and home recipe creator. High-engagement community.', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400')
ON CONFLICT (handle) DO NOTHING;

-- 5 sample campaigns
INSERT INTO campaigns (title, brand_name, niche, description, budget, collab_type, target_tier, min_engagement_rate, status) VALUES
('GlowUp Skincare Launch', 'Lumiere Cosmetics', 'Beauty', 'We are launching a new vitamin-C serum line and looking for beauty creators to showcase before/after results over 2 weeks.', 5000, 'Paid', 'Mid', 4.0, 'Active'),
('NomadGear Backpack Review', 'TrailBlaze Co.', 'Travel', 'Send our new 40L travel backpack to creators for an honest review video. Barter only — keep the bag!', 0, 'Barter', 'Micro', 5.0, 'Active'),
('FitTracker App Affiliate', 'PulseFit', 'Fitness', 'Promote our new fitness tracking app. Earn 30% commission on every sign-up through your unique link.', 0, 'Affiliate', 'Nano', 7.0, 'Active'),
('SmartHome Gadget Unboxing', 'NexTech', 'Tech', 'Looking for tech creators to unbox and review our new smart-home hub. Paid collaboration with product provided.', 3000, 'Paid', 'Micro', 5.0, 'Active'),
('Street Food Festival Promo', 'CityBites', 'Food', 'Promote our upcoming street food festival in 3 cities. Looking for high-engagement food creators for reel content.', 2500, 'Paid', 'Macro', 10.0, 'Active')
ON CONFLICT DO NOTHING;

-- Sample applications (link by handle/title for rebuild safety)
DO $$
DECLARE
  v_creator_id uuid;
  v_campaign_id uuid;
BEGIN
  -- @fitwithlena applies to FitTracker App Affiliate (Nano target, 7% min — 8.5% qualifies)
  SELECT id INTO v_creator_id FROM creators WHERE handle = '@fitwithlena';
  SELECT id INTO v_campaign_id FROM campaigns WHERE title = 'FitTracker App Affiliate';
  IF v_creator_id IS NOT NULL AND v_campaign_id IS NOT NULL THEN
    INSERT INTO applications (creator_id, campaign_id, pitch, rate_estimate, status)
    VALUES (v_creator_id, v_campaign_id, 'I have a highly engaged fitness community that loves trying new tracking tools. I can create 3 reels showing real workout tracking sessions.', 0, 'Approved')
    ON CONFLICT DO NOTHING;
  END IF;

  -- @wanderlust.mia applies to NomadGear Backpack Review
  SELECT id INTO v_creator_id FROM creators WHERE handle = '@wanderlust.mia';
  SELECT id INTO v_campaign_id FROM campaigns WHERE title = 'NomadGear Backpack Review';
  IF v_creator_id IS NOT NULL AND v_campaign_id IS NOT NULL THEN
    INSERT INTO applications (creator_id, campaign_id, pitch, rate_estimate, status)
    VALUES (v_creator_id, v_campaign_id, 'As a solo traveler who has visited 40+ countries, I can put this backpack through real-world testing across multiple destinations. Expect stunning travel footage.', 800, 'Applied')
    ON CONFLICT DO NOTHING;
  END IF;

  -- @eatswithdev applies to Street Food Festival Promo (Macro target, 10% min — 15% engagement unlocks)
  SELECT id INTO v_creator_id FROM creators WHERE handle = '@eatswithdev';
  SELECT id INTO v_campaign_id FROM campaigns WHERE title = 'Street Food Festival Promo';
  IF v_creator_id IS NOT NULL AND v_campaign_id IS NOT NULL THEN
    INSERT INTO applications (creator_id, campaign_id, pitch, rate_estimate, status)
    VALUES (v_creator_id, v_campaign_id, 'My community goes crazy for street food content. I can create high-energy reels from all 3 festival cities with my signature style. 15% engagement means real reach.', 2500, 'Applied')
    ON CONFLICT DO NOTHING;
  END IF;
END $$;