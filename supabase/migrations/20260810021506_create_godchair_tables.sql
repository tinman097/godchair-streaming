/*
# GodChair Backend — Cache, Watch History, Favorites

## Overview
Creates the database tables that back the GodChair anime streaming API.
The edge function caches Jikan API responses to reduce external calls and
support Pi 4 deployment with limited bandwidth. Watch history and favorites
are stored per-device (no auth) using a device_id string.

## New Tables

1. `anime_cache`
   - `cache_key` (text, primary key) — the endpoint path+query string
   - `response_data` (jsonb) — the full cached API response
   - `fetched_at` (timestamptz) — when the cache entry was written
   - `expires_at` (timestamptz) — when the cache entry becomes stale

2. `watch_history`
   - `id` (uuid, primary key)
   - `device_id` (text, not null) — identifies the browser/device
   - `mal_id` (integer, not null) — MyAnimeList anime ID
   - `anime_title` (text) — denormalized title for quick display
   - `anime_image` (text) — denormalized poster URL
   - `episode` (integer, default 1)
   - `watched_at` (timestamptz, default now())

3. `favorites`
   - `id` (uuid, primary key)
   - `device_id` (text, not null)
   - `mal_id` (integer, not null)
   - `anime_title` (text)
   - `anime_image` (text)
   - `created_at` (timestamptz, default now())
   - Unique constraint on (device_id, mal_id) to prevent duplicate favorites

## Indexes
- `idx_cache_expires` on anime_cache(expires_at) for cache cleanup
- `idx_history_device` on watch_history(device_id, watched_at desc)
- `idx_favorites_device` on favorites(device_id, created_at desc)

## Security
- RLS enabled on all tables.
- All tables use `TO anon, authenticated` since this is a no-auth app.
- anime_cache: full CRUD for anon+authenticated
- watch_history: CRUD for anon+authenticated
- favorites: CRUD for anon+authenticated
*/

-- anime_cache: stores cached Jikan API responses
CREATE TABLE IF NOT EXISTS anime_cache (
  cache_key text PRIMARY KEY,
  response_data jsonb NOT NULL,
  fetched_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cache_expires ON anime_cache(expires_at);

-- watch_history: per-device viewing history
CREATE TABLE IF NOT EXISTS watch_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  mal_id integer NOT NULL,
  anime_title text,
  anime_image text,
  episode integer DEFAULT 1,
  watched_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_history_device ON watch_history(device_id, watched_at DESC);

-- favorites: per-device favorited anime
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id text NOT NULL,
  mal_id integer NOT NULL,
  anime_title text,
  anime_image text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(device_id, mal_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_device ON favorites(device_id, created_at DESC);

-- Enable RLS on all tables
ALTER TABLE anime_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE watch_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- anime_cache policies
DROP POLICY IF EXISTS "anon_select_cache" ON anime_cache;
CREATE POLICY "anon_select_cache" ON anime_cache FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cache" ON anime_cache;
CREATE POLICY "anon_insert_cache" ON anime_cache FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cache" ON anime_cache;
CREATE POLICY "anon_update_cache" ON anime_cache FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cache" ON anime_cache;
CREATE POLICY "anon_delete_cache" ON anime_cache FOR DELETE
  TO anon, authenticated USING (true);

-- watch_history policies
DROP POLICY IF EXISTS "anon_select_history" ON watch_history;
CREATE POLICY "anon_select_history" ON watch_history FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_history" ON watch_history;
CREATE POLICY "anon_insert_history" ON watch_history FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_history" ON watch_history;
CREATE POLICY "anon_update_history" ON watch_history FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_history" ON watch_history;
CREATE POLICY "anon_delete_history" ON watch_history FOR DELETE
  TO anon, authenticated USING (true);

-- favorites policies
DROP POLICY IF EXISTS "anon_select_favorites" ON favorites;
CREATE POLICY "anon_select_favorites" ON favorites FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_favorites" ON favorites;
CREATE POLICY "anon_insert_favorites" ON favorites FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_favorites" ON favorites;
CREATE POLICY "anon_delete_favorites" ON favorites FOR DELETE
  TO anon, authenticated USING (true);
