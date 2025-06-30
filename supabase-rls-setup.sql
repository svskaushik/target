-- ================================================
-- COMPREHENSIVE SUPABASE RLS POLICIES SETUP
-- Target Sheet Application Database Security
-- ================================================

-- This script sets up Row Level Security (RLS) policies for the Target Sheet application
-- It ensures users can only access their own data across all tables

-- Enable RLS on all application tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shot_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aperture_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elevation_settings ENABLE ROW LEVEL SECURITY;

-- ================================================
-- DROP EXISTING POLICIES (cleanup for rerunning script)
-- ================================================

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.profiles;

-- Targets policies  
DROP POLICY IF EXISTS "Users can view their own targets" ON public.targets;
DROP POLICY IF EXISTS "Users can insert their own targets" ON public.targets;
DROP POLICY IF EXISTS "Users can update their own targets" ON public.targets;
DROP POLICY IF EXISTS "Users can delete their own targets" ON public.targets;

-- Sessions policies
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.sessions;

-- Shot placements policies
DROP POLICY IF EXISTS "Users can view shots from their own sessions" ON public.shot_placements;
DROP POLICY IF EXISTS "Users can insert shots into their own sessions" ON public.shot_placements;
DROP POLICY IF EXISTS "Users can update shots in their own sessions" ON public.shot_placements;
DROP POLICY IF EXISTS "Users can delete shots from their own sessions" ON public.shot_placements;

-- Settings policies
DROP POLICY IF EXISTS "Users can manage their own aperture settings" ON public.aperture_settings;
DROP POLICY IF EXISTS "Users can manage their own elevation settings" ON public.elevation_settings;

-- ================================================
-- PROFILES TABLE RLS POLICIES
-- ================================================

-- Users can view their own profile
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Users can update their own profile  
CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for profile creation)
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" 
ON public.profiles FOR DELETE 
TO authenticated 
USING (auth.uid() = id);

-- ================================================
-- TARGETS TABLE RLS POLICIES
-- ================================================

-- Users can view their own targets
CREATE POLICY "Users can view their own targets" 
ON public.targets FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can insert their own targets
CREATE POLICY "Users can insert their own targets" 
ON public.targets FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own targets
CREATE POLICY "Users can update their own targets" 
ON public.targets FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own targets
CREATE POLICY "Users can delete their own targets" 
ON public.targets FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- ================================================
-- SESSIONS TABLE RLS POLICIES
-- ================================================

-- Users can view their own sessions
CREATE POLICY "Users can view their own sessions" 
ON public.sessions FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

-- Users can insert their own sessions
CREATE POLICY "Users can insert their own sessions" 
ON public.sessions FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update their own sessions" 
ON public.sessions FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete their own sessions" 
ON public.sessions FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- ================================================
-- SHOT PLACEMENTS TABLE RLS POLICIES
-- ================================================

-- Users can view shots from their own sessions
CREATE POLICY "Users can view shots from their own sessions" 
ON public.shot_placements FOR SELECT 
TO authenticated 
USING (
  session_id IN (
    SELECT id FROM public.sessions WHERE user_id = auth.uid()
  )
);

-- Users can insert shots into their own sessions
CREATE POLICY "Users can insert shots into their own sessions" 
ON public.shot_placements FOR INSERT 
TO authenticated 
WITH CHECK (
  session_id IN (
    SELECT id FROM public.sessions WHERE user_id = auth.uid()
  )
);

-- Users can update shots in their own sessions
CREATE POLICY "Users can update shots in their own sessions" 
ON public.shot_placements FOR UPDATE 
TO authenticated 
USING (
  session_id IN (
    SELECT id FROM public.sessions WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  session_id IN (
    SELECT id FROM public.sessions WHERE user_id = auth.uid()
  )
);

-- Users can delete shots from their own sessions
CREATE POLICY "Users can delete shots from their own sessions" 
ON public.shot_placements FOR DELETE 
TO authenticated 
USING (
  session_id IN (
    SELECT id FROM public.sessions WHERE user_id = auth.uid()
  )
);

-- ================================================
-- APERTURE SETTINGS TABLE RLS POLICIES
-- ================================================

-- Users can manage all operations on their own aperture settings
CREATE POLICY "Users can manage their own aperture settings" 
ON public.aperture_settings FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================
-- ELEVATION SETTINGS TABLE RLS POLICIES  
-- ================================================

-- Users can manage all operations on their own elevation settings
CREATE POLICY "Users can manage their own elevation settings" 
ON public.elevation_settings FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- ================================================
-- PERFORMANCE OPTIMIZATION INDEXES
-- ================================================

-- Create indexes for efficient policy checks (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);
CREATE INDEX IF NOT EXISTS idx_targets_user_id ON public.targets(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_shot_placements_session_id ON public.shot_placements(session_id);
CREATE INDEX IF NOT EXISTS idx_aperture_settings_user_id ON public.aperture_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_elevation_settings_user_id ON public.elevation_settings(user_id);

-- ================================================
-- GRANT NECESSARY PERMISSIONS
-- ================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on tables to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.targets TO authenticated;
GRANT ALL ON public.sessions TO authenticated;
GRANT ALL ON public.shot_placements TO authenticated;
GRANT ALL ON public.aperture_settings TO authenticated;
GRANT ALL ON public.elevation_settings TO authenticated;

-- Grant select permissions to anonymous users (for public access if needed)
GRANT SELECT ON public.profiles TO anon;

-- Grant permissions on sequences
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute permissions on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Test RLS policies with example queries (run these to verify setup)
-- Note: Replace 'your-user-id' with an actual user ID for testing

/*
-- Test as authenticated user (set role and JWT first)
SET role authenticated;
SET request.jwt.claims TO '{"sub":"your-user-id", "role":"authenticated"}';

-- Test target operations
SELECT * FROM targets; -- Should only show user's targets
INSERT INTO targets (name, distance, target_type, user_id) 
VALUES ('Test Target', 25, 'bullseye', 'your-user-id'); -- Should succeed

-- Test session operations  
SELECT * FROM sessions; -- Should only show user's sessions
INSERT INTO sessions (name, target_id, user_id) 
VALUES ('Test Session', 'target-id', 'your-user-id'); -- Should succeed

-- Reset role
RESET role;
*/

-- ================================================
-- COMPLETION MESSAGE
-- ================================================

DO $$
BEGIN
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'RLS POLICIES SETUP COMPLETE!';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'All tables now have Row Level Security enabled';
    RAISE NOTICE 'Users can only access their own data';  
    RAISE NOTICE 'Performance indexes have been created';
    RAISE NOTICE 'Permissions have been granted';
    RAISE NOTICE '';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Test authentication in your application';
    RAISE NOTICE '2. Verify target/session creation works';
    RAISE NOTICE '3. Confirm 403 errors are resolved';
    RAISE NOTICE '==============================================';
END $$;
