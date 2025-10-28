-- Supabase Auth 설정 확인 및 수정

-- 1. 현재 Auth 설정 확인
SELECT 
    'Auth 설정 확인' as 구분,
    raw_app_meta_data,
    raw_user_meta_data,
    email,
    email_confirmed_at,
    created_at
FROM auth.users 
ORDER BY created_at DESC
LIMIT 10;

-- 2. Auth 스키마 테이블 확인
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'auth'
AND table_name = 'users'
ORDER BY ordinal_position;

-- 3. 직접 Auth 사용자 생성 시도 (관리자 권한 필요)
-- 이 쿼리는 Supabase 대시보드에서 실행해야 할 수 있습니다

-- 4. 현재 RLS 정책 상태 확인
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
ORDER BY tablename, policyname;

-- 5. 사용자 프로필 테이블 상태 확인
SELECT 
    COUNT(*) as 프로필_수,
    MAX(created_at) as 최근_생성일
FROM public.user_profiles_2025_09_27_12_14;

-- 6. Auth 트리거 확인
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table LIKE '%user_profiles%';

-- 임시 해결책: 직접 테스트 사용자 생성 (서비스 역할 키 필요)
-- 이 부분은 Edge Function에서 실행되어야 합니다