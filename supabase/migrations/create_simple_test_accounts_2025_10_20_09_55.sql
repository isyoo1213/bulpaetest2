-- 간단한 테스트 계정 생성

-- 1. 기존 프로필 삭제 (있다면)
DELETE FROM public.user_profiles_2025_09_27_12_14 WHERE username IN ('admin', 'testuser');

-- 2. 테스트용 프로필 직접 생성 (임시 UUID 사용)
INSERT INTO public.user_profiles_2025_09_27_12_14 (
    id,
    user_id,
    username,
    full_name,
    initial_capital,
    current_capital,
    created_at,
    updated_at
) VALUES 
(
    1001,
    '11111111-1111-1111-1111-111111111111',
    'admin',
    '시스템 관리자',
    10000000,
    10000000,
    NOW(),
    NOW()
),
(
    1002,
    '22222222-2222-2222-2222-222222222222',
    'testuser',
    '테스트 사용자',
    10000000,
    10000000,
    NOW(),
    NOW()
);

-- 3. 생성된 프로필 확인
SELECT 
    '생성된 테스트 프로필' as 구분,
    id,
    user_id,
    username,
    full_name,
    initial_capital,
    current_capital,
    created_at
FROM public.user_profiles_2025_09_27_12_14 
WHERE username IN ('admin', 'testuser')
ORDER BY username;

-- 4. RLS 정책 임시 비활성화 (테스트용)
ALTER TABLE public.user_profiles_2025_09_27_12_14 DISABLE ROW LEVEL SECURITY;

-- 5. 테스트 완료 후 다시 활성화할 수 있도록 안내
SELECT 'RLS 정책이 임시로 비활성화되었습니다. 테스트 완료 후 다시 활성화하세요.' as 안내;