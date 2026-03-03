-- Paste and RUN this entire block in the Supabase SQL Editor to create your tables!

-- Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  photo_url VARCHAR(500),
  role VARCHAR(50) DEFAULT 'user',
  region VARCHAR(500) DEFAULT '',
  is_verified BOOLEAN DEFAULT false,
  followers JSONB DEFAULT '[]'::jsonb,
  following JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create Retailers Table
CREATE TABLE IF NOT EXISTS public.retailers (
  id SERIAL PRIMARY KEY,
  retailer_id VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  image VARCHAR(500),
  location VARCHAR(500) NOT NULL,
  maps_link VARCHAR(500),
  iframe_link VARCHAR(500),
  rating INTEGER DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  contact VARCHAR(20),
  verified BOOLEAN DEFAULT false,
  stock JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

-- Relax RLS Policies (for initial dev testing)
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.retailers DISABLE ROW LEVEL SECURITY;

-- Create Communities Table
CREATE TABLE IF NOT EXISTS public.communities (
  id VARCHAR(255) PRIMARY KEY, -- The URL-safe tag, e.g., "wheat"
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  banner_url VARCHAR(500) DEFAULT '',
  icon_url VARCHAR(500) DEFAULT '',
  post_count INTEGER DEFAULT 0,
  creator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  creator_username VARCHAR(255),
  creator_role VARCHAR(50),
  type VARCHAR(50) DEFAULT 'public',
  is_mature BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  uid UUID REFERENCES public.users(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  author_photo_url VARCHAR(500) DEFAULT '',
  author_role VARCHAR(50) DEFAULT 'user',
  title VARCHAR(500) NOT NULL,
  text TEXT NOT NULL,
  community_id VARCHAR(255) REFERENCES public.communities(id) ON DELETE CASCADE,
  image_url VARCHAR(500) DEFAULT '',
  comment_count INTEGER DEFAULT 0,
  upvotes JSONB DEFAULT '[]'::jsonb,
  downvotes JSONB DEFAULT '[]'::jsonb,
  pinned_comment_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  uid UUID REFERENCES public.users(id) ON DELETE CASCADE,
  author VARCHAR(255) NOT NULL,
  author_photo_url VARCHAR(500) DEFAULT '',
  author_role VARCHAR(50) DEFAULT 'user',
  text TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  reply_count INTEGER DEFAULT 0,
  upvotes JSONB DEFAULT '[]'::jsonb,
  downvotes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Note: We add the foreign key for pinned_comment_id AFTER the comments table is created
ALTER TABLE public.posts 
  ADD CONSTRAINT fk_pinned_comment 
  FOREIGN KEY (pinned_comment_id) 
  REFERENCES public.comments(id) ON DELETE SET NULL;

-- Relax RLS Policies for Community Tables
ALTER TABLE public.communities DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments DISABLE ROW LEVEL SECURITY;

-- Create Community Chat Messages Table
CREATE TABLE IF NOT EXISTS public.community_chat_messages (
  id SERIAL PRIMARY KEY,
  community_id VARCHAR(255) NOT NULL,
  sender_id VARCHAR(255) NOT NULL,
  sender_name VARCHAR(255) NOT NULL,
  sender_photo_url VARCHAR(500),
  text VARCHAR(2000) NOT NULL,
  created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.community_chat_messages DISABLE ROW LEVEL SECURITY;
