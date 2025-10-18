-- Judo Academy Database Schema
-- Supabase SQL Setup Script

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('admin', 'instructor', 'student')) DEFAULT 'student',
  belt_level TEXT CHECK (belt_level IN ('white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black')) DEFAULT 'white',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMPTZ
);

-- Content categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Content items (techniques, theory, documents, etc.)
CREATE TABLE IF NOT EXISTS public.content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT CHECK (content_type IN ('technique', 'theory', 'document', 'video', 'image', 'audio')) NOT NULL,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  file_url TEXT,
  file_size BIGINT,
  file_type TEXT,
  mime_type TEXT,
  thumbnail_url TEXT,
  duration INTEGER, -- for videos/audio in seconds
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced', 'all_levels')) DEFAULT 'all_levels',
  required_belt_level TEXT CHECK (required_belt_level IN ('white', 'yellow', 'orange', 'green', 'blue', 'brown', 'black')) DEFAULT 'white',
  tags TEXT[],
  metadata JSONB,
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- User content access tracking
CREATE TABLE IF NOT EXISTS public.user_content_access (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  access_type TEXT CHECK (access_type IN ('view', 'download', 'bookmark')) NOT NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id, access_type)
);

-- User bookmarks/favorites
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'completed')) DEFAULT 'not_started',
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  completed_at TIMESTAMPTZ,
  time_spent INTEGER DEFAULT 0, -- in seconds
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, content_id)
);

-- System settings and configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Storage buckets setup (Supabase Storage)
-- These are created through Supabase Dashboard or CLI
-- Files will be stored in: content-files, user-avatars, thumbnails

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_content_category ON public.content(category_id);
CREATE INDEX IF NOT EXISTS idx_content_type ON public.content(content_type);
CREATE INDEX IF NOT EXISTS idx_content_created_by ON public.content(created_by);
CREATE INDEX IF NOT EXISTS idx_content_is_public ON public.content(is_public);
CREATE INDEX IF NOT EXISTS idx_user_content_access_user ON public.user_content_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_content_access_content ON public.user_content_access(content_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at);

-- Row Level Security (RLS) Policies

-- Profiles policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can update any profile" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Categories policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Content policies
ALTER TABLE public.content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public content is viewable by all" ON public.content FOR SELECT USING (is_public = true);
CREATE POLICY "Authenticated users can view content by belt level" ON public.content FOR SELECT USING (
  auth.role() = 'authenticated' AND 
  (is_public = true OR 
   EXISTS (
     SELECT 1 FROM public.profiles 
     WHERE id = auth.uid() AND 
     CASE 
       WHEN required_belt_level = 'white' THEN true
       WHEN required_belt_level = 'yellow' THEN belt_level IN ('yellow', 'orange', 'green', 'blue', 'brown', 'black')
       WHEN required_belt_level = 'orange' THEN belt_level IN ('orange', 'green', 'blue', 'brown', 'black')
       WHEN required_belt_level = 'green' THEN belt_level IN ('green', 'blue', 'brown', 'black')
       WHEN required_belt_level = 'blue' THEN belt_level IN ('blue', 'brown', 'black')
       WHEN required_belt_level = 'brown' THEN belt_level IN ('brown', 'black')
       WHEN required_belt_level = 'black' THEN belt_level = 'black'
     END
   ))
);
CREATE POLICY "Admins can manage all content" ON public.content FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- User content access policies
ALTER TABLE public.user_content_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own access history" ON public.user_content_access FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create own access records" ON public.user_content_access FOR INSERT WITH CHECK (user_id = auth.uid());

-- User bookmarks policies
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bookmarks" ON public.user_bookmarks FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage own bookmarks" ON public.user_bookmarks FOR ALL USING (user_id = auth.uid());

-- User progress policies
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can create own progress" ON public.user_progress FOR INSERT WITH CHECK (user_id = auth.uid());

-- System settings policies
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public settings are viewable" ON public.system_settings FOR SELECT USING (is_public = true);
CREATE POLICY "Admins can manage settings" ON public.system_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Activity logs policies
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own activity" ON public.activity_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all activity" ON public.activity_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Notifications policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());

-- Functions and Triggers

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON public.content 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress 
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default categories
INSERT INTO public.categories (name, description) VALUES
('Techniques', 'Judo throwing and grappling techniques'),
('Theory', 'Judo philosophy, history, and theoretical knowledge'),
('Kata', 'Formal judo exercises and forms'),
('Competition', 'Tournament rules, strategies, and preparation'),
('Fitness', 'Physical conditioning and flexibility for judo'),
('Safety', 'Injury prevention and dojo safety protocols');

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, is_public) VALUES
('site_name', 'Judo Academy', 'Name of the judo academy', true),
('site_description', 'Traditional judo training with modern technology', 'Site description for SEO', true),
('max_file_size', '52428800', 'Maximum file upload size in bytes (50MB)', false),
('allowed_file_types', 'image/*,video/*,application/pdf,.doc,.docx', 'Allowed file types for uploads', false),
('require_approval', 'false', 'Whether new users require admin approval', false);