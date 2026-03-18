/*
  # HighTalk: Elevated Discussion - Initial Schema

  ## Summary
  This migration creates the foundational database schema for the HighTalk platform,
  an intellectual video content hub focused on elevated discourse.

  ## New Tables

  ### 1. `categories`
  Stores content categories representing intellectual discussion topics.
  - id, name, description, content_guidelines, icon_name, sort_order

  ### 2. `channels`
  Creator/channel profiles on the platform.
  - id, user_id (auth.users), channel_name, bio, profile_image_url, banner_url
  - subscriber_count, verification_status, is_active

  ### 3. `videos`
  Core video content records.
  - id, title, description, video_url, thumbnail_url
  - category_id (FK to categories), creator_id (FK to channels)
  - upload_date, view_count, duration_seconds, is_approved, moderation_status

  ### 4. `comments`
  Nested comment system with moderation support.
  - id, video_id, user_id, parent_comment_id (self-ref), body
  - is_flagged, moderation_status

  ### 5. `playlists`
  Curated video collections.
  - id, user_id, title, description, is_public

  ### 6. `playlist_videos`
  Junction table for playlists <-> videos.
  - playlist_id, video_id, sort_order

  ### 7. `content_reports`
  Community moderation system.
  - id, reporter_id, video_id, comment_id, reason, details, status

  ### 8. `engagement_metrics`
  Per-video engagement tracking (views, likes, watch_time).
  - id, video_id, user_id, liked, watch_time_seconds, last_watched_at

  ## Security
  - RLS enabled on all tables
  - Authenticated users can read approved/public content
  - Users can only modify their own data
  - Admins have elevated access via app_metadata role
*/

-- ─── CATEGORIES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  content_guidelines text NOT NULL DEFAULT '',
  icon_name text NOT NULL DEFAULT 'Circle',
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categories"
  ON categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update categories"
  ON categories FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─── CHANNELS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel_name text NOT NULL,
  bio text NOT NULL DEFAULT '',
  profile_image_url text NOT NULL DEFAULT '',
  banner_url text NOT NULL DEFAULT '',
  subscriber_count integer NOT NULL DEFAULT 0,
  verification_status text NOT NULL DEFAULT 'unverified',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE channels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active channels"
  ON channels FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Users can insert own channel"
  ON channels FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own channel"
  ON channels FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── VIDEOS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  video_url text NOT NULL DEFAULT '',
  thumbnail_url text NOT NULL DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  creator_id uuid REFERENCES channels(id) ON DELETE CASCADE,
  upload_date timestamptz DEFAULT now(),
  view_count integer NOT NULL DEFAULT 0,
  like_count integer NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 0,
  is_approved boolean NOT NULL DEFAULT false,
  moderation_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved videos"
  ON videos FOR SELECT
  TO authenticated
  USING (is_approved = true AND moderation_status = 'approved');

CREATE POLICY "Creators can insert own videos"
  ON videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = creator_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can update own videos"
  ON videos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = creator_id
      AND channels.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels
      WHERE channels.id = creator_id
      AND channels.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can update any video"
  ON videos FOR UPDATE
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─── COMMENTS ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_flagged boolean NOT NULL DEFAULT false,
  moderation_status text NOT NULL DEFAULT 'approved',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved comments"
  ON comments FOR SELECT
  TO authenticated
  USING (moderation_status = 'approved');

CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─── PLAYLISTS ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  is_public boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own playlists"
  ON playlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own playlists"
  ON playlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own playlists"
  ON playlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own playlists"
  ON playlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ─── PLAYLIST VIDEOS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playlist_videos (
  playlist_id uuid NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  sort_order integer NOT NULL DEFAULT 0,
  added_at timestamptz DEFAULT now(),
  PRIMARY KEY (playlist_id, video_id)
);

ALTER TABLE playlist_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own playlist videos"
  ON playlist_videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_id
      AND (playlists.user_id = auth.uid() OR playlists.is_public = true)
    )
  );

CREATE POLICY "Users can insert into own playlists"
  ON playlist_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete from own playlists"
  ON playlist_videos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE playlists.id = playlist_id
      AND playlists.user_id = auth.uid()
    )
  );

-- ─── CONTENT REPORTS ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  video_id uuid REFERENCES videos(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  reason text NOT NULL,
  details text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert reports"
  ON content_reports FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Users can read own reports"
  ON content_reports FOR SELECT
  TO authenticated
  USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can read all reports"
  ON content_reports FOR SELECT
  TO authenticated
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ─── ENGAGEMENT METRICS ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS engagement_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  liked boolean NOT NULL DEFAULT false,
  watch_time_seconds integer NOT NULL DEFAULT 0,
  last_watched_at timestamptz DEFAULT now(),
  UNIQUE (video_id, user_id)
);

ALTER TABLE engagement_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own engagement"
  ON engagement_metrics FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own engagement"
  ON engagement_metrics FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own engagement"
  ON engagement_metrics FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ─── SEED CATEGORIES ──────────────────────────────────────────────────────────
INSERT INTO categories (name, description, icon_name, sort_order) VALUES
  ('All', 'All content on the platform', 'LayoutGrid', 0),
  ('Philosophy & Ethics', 'Discussions on consciousness, morality, and society', 'Brain', 1),
  ('Creative Arts', 'Music production, visual arts, writing, and creative process', 'Palette', 2),
  ('Science & Learning', 'Neuroscience, academic topics, and educational content', 'FlaskConical', 3),
  ('Problem Solving', 'Coding sessions, engineering, and mathematics', 'Code2', 4),
  ('Deep Conversations', 'Interviews, debates, and thoughtful discussions', 'MessageSquare', 5),
  ('Productivity Workflows', 'Study sessions, work routines, and focus techniques', 'Timer', 6),
  ('Mindfulness & Mental Health', 'Meditation, therapy discussions, and self-improvement', 'Heart', 7),
  ('Book Clubs & Literature', 'Reading discussions and literary analysis', 'BookOpen', 8),
  ('Documentary & Research', 'Investigative content and research presentations', 'Search', 9)
ON CONFLICT (name) DO NOTHING;
