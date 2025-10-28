-- 직접 테스트 계정 생성 및 확인

-- 1. 현재 Auth 사용자 확인
SELECT 
    'Auth 사용자 수' as 구분,
    COUNT(*) as 개수
FROM auth.users;

-- 2. 현재 프로필 사용자 확인  
SELECT 
    '프로필 사용자 수' as 구분,
    COUNT(*) as 개수
FROM public.user_profiles_2025_09_27_12_14;

-- 3. Auth 설정 확인
SELECT 
    'Auth 설정' as 구분,
    raw_app_meta_data,
    raw_user_meta_data,
    email_confirmed_at,
    created_at
FROM auth.users 
LIMIT 5;

-- 4. RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE '%user_profiles%'
ORDER BY tablename, policyname;

-- 5. 테이블 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_profiles_2025_09_27_12_14'
ORDER BY ordinal_position;