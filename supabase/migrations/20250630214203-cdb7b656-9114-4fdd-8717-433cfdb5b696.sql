
-- Create articles table to store blog posts
CREATE TABLE public.articles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT,
  meta_description TEXT,
  author TEXT NOT NULL,
  publish_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_time TEXT,
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  trending BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create comments table for user comments
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trending_topics table to store fetched trends
CREATE TABLE public.trending_topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  topic TEXT NOT NULL,
  source TEXT NOT NULL, -- 'google_trends' or 'twitter'
  search_volume INTEGER,
  region TEXT,
  fetched_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  used_for_article BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trending_topics ENABLE ROW LEVEL SECURITY;

-- Articles policies (public read, admin write)
CREATE POLICY "Articles are viewable by everyone" 
  ON public.articles FOR SELECT 
  USING (true);

CREATE POLICY "Articles can be inserted by authenticated users" 
  ON public.articles FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Articles can be updated by authenticated users" 
  ON public.articles FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

-- Comments policies (authenticated users only)
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT 
  USING (true);

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON public.comments FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.comments FOR DELETE 
  USING (auth.uid() = user_id);

-- Profiles policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT 
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Trending topics policies (admin only for write)
CREATE POLICY "Trending topics are viewable by everyone"
  ON public.trending_topics FOR SELECT 
  USING (true);

CREATE POLICY "Trending topics can be managed by authenticated users"
  ON public.trending_topics FOR ALL 
  USING (auth.uid() IS NOT NULL);

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_articles_slug ON public.articles(slug);
CREATE INDEX idx_articles_trending ON public.articles(trending);
CREATE INDEX idx_articles_publish_date ON public.articles(publish_date DESC);
CREATE INDEX idx_comments_article_id ON public.comments(article_id);
CREATE INDEX idx_trending_topics_source ON public.trending_topics(source);
CREATE INDEX idx_trending_topics_fetched_at ON public.trending_topics(fetched_at DESC);
