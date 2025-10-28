-- 직접 테스트 계정 생성 (SQL 방식)

-- 1. 기존 테스트 계정 삭제 (있다면)
DELETE FROM auth.users WHERE email IN ('admin@bulpae.com', 'user@bulpae.com');
DELETE FROM public.user_profiles_2025_09_27_12_14 WHERE username IN ('admin', 'testuser');

-- 2. 관리자 계정 생성
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@bulpae.com',
    crypt('admin123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "admin", "full_name": "시스템 관리자"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 3. 일반 사용자 계정 생성
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'user@bulpae.com',
    crypt('user123!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "testuser", "full_name": "테스트 사용자"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
);

-- 4. 생성된 사용자 확인
SELECT 
    'Auth 사용자' as 구분,
    id,
    email,
    email_confirmed_at,
    raw_user_meta_data->>'username' as username,
    raw_user_meta_data->>'full_name' as full_name,
    created_at
FROM auth.users 
WHERE email IN ('admin@bulpae.com', 'user@bulpae.com')
ORDER BY email;

-- 5. 프로필 생성을 위한 사용자 ID 조회 및 프로필 생성
DO $$
DECLARE
    admin_user_id UUID;
    user_user_id UUID;
BEGIN
    -- 관리자 사용자 ID 조회
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@bulpae.com';
    
    -- 일반 사용자 ID 조회
    SELECT id INTO user_user_id FROM auth.users WHERE email = 'user@bulpae.com';
    
    -- 관리자 프로필 생성
    IF admin_user_id IS NOT NULL THEN
        INSERT INTO public.user_profiles_2025_09_27_12_14 (
            user_id,
            username,
            full_name,
            initial_capital,
            current_capital,
            created_at,
            updated_at
        ) VALUES (
            admin_user_id,
            'admin',
            '시스템 관리자',
            10000000,
            10000000,
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    -- 일반 사용자 프로필 생성
    IF user_user_id IS NOT NULL THEN
        INSERT INTO public.user_profiles_2025_09_27_12_14 (
            user_id,
            username,
            full_name,
            initial_capital,
            current_capital,
            created_at,
            updated_at
        ) VALUES (
            user_user_id,
            'testuser',
            '테스트 사용자',
            10000000,
            10000000,
            NOW(),
            NOW()
        ) ON CONFLICT (user_id) DO NOTHING;
    END IF;
END $$;

-- 6. 생성된 프로필 확인
SELECT 
    'User Profile' as 구분,
    up.id,
    up.username,
    up.full_name,
    au.email,
    up.created_at
FROM public.user_profiles_2025_09_27_12_14 up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN ('admin@bulpae.com', 'user@bulpae.com')
ORDER BY au.email;