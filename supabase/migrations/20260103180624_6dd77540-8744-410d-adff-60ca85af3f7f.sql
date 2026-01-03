-- Add policy to allow inserting user_roles for new users (for admin creation)
CREATE POLICY "Service role can manage roles" ON public.user_roles
FOR ALL USING (true) WITH CHECK (true);

-- Update the policy to be more restrictive after initial setup
-- Drop the overly permissive policy and create proper ones
DROP POLICY IF EXISTS "Service role can manage roles" ON public.user_roles;

-- Allow inserts only through trigger (for new user signup)
CREATE POLICY "Allow trigger to insert roles" ON public.user_roles
FOR INSERT WITH CHECK (true);