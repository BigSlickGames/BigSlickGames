/*
  # Create Forum Tables

  1. New Tables
    - `forum_posts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `content` (text)
      - `image_url` (text, optional)
      - `likes_count` (integer, default 0)
      - `comments_count` (integer, default 0)
      - `is_pinned` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `forum_comments`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to forum_posts)
      - `user_id` (uuid, foreign key to profiles)
      - `content` (text)
      - `likes_count` (integer, default 0)
      - `created_at` (timestamp)
    
    - `forum_likes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `post_id` (uuid, foreign key to forum_posts, optional)
      - `comment_id` (uuid, foreign key to forum_comments, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own content
    - Add policies for reading public content
*/

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  image_url text,
  likes_count integer DEFAULT 0 NOT NULL,
  comments_count integer DEFAULT 0 NOT NULL,
  is_pinned boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create forum_comments table
CREATE TABLE IF NOT EXISTS forum_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  likes_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create forum_likes table
CREATE TABLE IF NOT EXISTS forum_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  comment_id uuid REFERENCES forum_comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now() NOT NULL,
  CONSTRAINT forum_likes_target_check CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  ),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id)
);

-- Enable RLS
ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_likes ENABLE ROW LEVEL SECURITY;

-- Forum posts policies
CREATE POLICY "Anyone can read forum posts"
  ON forum_posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own posts"
  ON forum_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON forum_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON forum_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Forum comments policies
CREATE POLICY "Anyone can read forum comments"
  ON forum_comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own comments"
  ON forum_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON forum_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON forum_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Forum likes policies
CREATE POLICY "Anyone can read forum likes"
  ON forum_likes
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their own likes"
  ON forum_likes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS forum_posts_user_id_idx ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS forum_posts_created_at_idx ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS forum_posts_is_pinned_idx ON forum_posts(is_pinned, created_at DESC);

CREATE INDEX IF NOT EXISTS forum_comments_post_id_idx ON forum_comments(post_id);
CREATE INDEX IF NOT EXISTS forum_comments_user_id_idx ON forum_comments(user_id);
CREATE INDEX IF NOT EXISTS forum_comments_created_at_idx ON forum_comments(created_at);

CREATE INDEX IF NOT EXISTS forum_likes_user_id_idx ON forum_likes(user_id);
CREATE INDEX IF NOT EXISTS forum_likes_post_id_idx ON forum_likes(post_id);
CREATE INDEX IF NOT EXISTS forum_likes_comment_id_idx ON forum_likes(comment_id);

-- Create updated_at trigger for forum_posts
CREATE OR REPLACE FUNCTION update_forum_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_forum_posts_updated_at_trigger'
  ) THEN
    CREATE TRIGGER update_forum_posts_updated_at_trigger
      BEFORE UPDATE ON forum_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_forum_posts_updated_at();
  END IF;
END $$;