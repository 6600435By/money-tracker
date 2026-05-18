-- Исправление: infinite recursion in policy for relation "profiles"
-- Выполните в Supabase SQL Editor

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Profiles select" ON profiles;
DROP POLICY IF EXISTS "Profiles update" ON profiles;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;

CREATE POLICY "Profiles select" ON profiles
  FOR SELECT USING (user_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Profiles update" ON profiles
  FOR UPDATE USING (public.is_admin());

-- Назначить администратора (замените email на свой)
UPDATE profiles
SET role = 'admin'
WHERE email = '6600435@gmail.com';
