-- 테스트 계정용 사용자 프로필 생성

-- 관리자 계정 프로필 생성 (이미 존재할 수 있으므로 ON CONFLICT 사용)
INSERT INTO public.user_profiles_2025_09_27_12_14 (
    user_id,
    username,
    full_name,
    initial_capital,
    current_capital
) VALUES (
    '00000000-0000-0000-0000-000000000001', -- 테스트 관리자 UUID
    'admin',
    '시스템 관리자',
    10000000,
    10000000
) ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name;

-- 일반 사용자 계정 프로필 생성
INSERT INTO public.user_profiles_2025_09_27_12_14 (
    user_id,
    username,
    full_name,
    initial_capital,
    current_capital
) VALUES (
    '00000000-0000-0000-0000-000000000002', -- 테스트 사용자 UUID
    'testuser',
    '테스트 사용자',
    10000000,
    10000000
) ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name;

-- 추가 팀 멤버들 생성 (6명 팀 구성)
INSERT INTO public.user_profiles_2025_09_27_12_14 (
    user_id,
    username,
    full_name,
    initial_capital,
    current_capital
) VALUES 
    ('00000000-0000-0000-0000-000000000003', 'member1', '김투자', 10000000, 10000000),
    ('00000000-0000-0000-0000-000000000004', 'member2', '이분석', 10000000, 10000000),
    ('00000000-0000-0000-0000-000000000005', 'member3', '박전략', 10000000, 10000000),
    ('00000000-0000-0000-0000-000000000006', 'member4', '최리스크', 10000000, 10000000)
ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name;

-- 테스트 그룹 생성 (관리자가 리더)
INSERT INTO public.study_groups_2025_09_27_12_14 (
    id,
    name,
    description,
    leader_id
) VALUES (
    '10000000-0000-0000-0000-000000000001',
    '테스트 스터디 그룹',
    '시스템 테스트를 위한 샘플 그룹입니다',
    (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE user_id = '00000000-0000-0000-0000-000000000001')
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- 그룹 멤버십 생성
INSERT INTO public.group_memberships_2025_09_27_12_14 (
    group_id,
    user_id
) 
SELECT 
    '10000000-0000-0000-0000-000000000001',
    up.id
FROM public.user_profiles_2025_09_27_12_14 up
WHERE up.user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000006'
)
ON CONFLICT (group_id, user_id) DO NOTHING;

-- 팀 설정 생성
INSERT INTO public.team_settings_2025_10_20_08_10 (
    group_id,
    team_color,
    team_slogan,
    team_goal
) VALUES (
    '10000000-0000-0000-0000-000000000001',
    '#3B82F6',
    '완벽한 시스템 테스트',
    '새로운 평가시스템의 모든 기능을 완벽하게 테스트하여 최고의 사용자 경험을 제공합니다'
) ON CONFLICT (group_id) DO UPDATE SET
    team_color = EXCLUDED.team_color,
    team_slogan = EXCLUDED.team_slogan,
    team_goal = EXCLUDED.team_goal;

-- 포인트 시스템 초기화
INSERT INTO public.user_points_2025_09_28_06_00 (
    user_id,
    current_points,
    total_earned,
    total_spent
)
SELECT 
    up.id,
    1000, -- 초기 포인트
    1000,
    0
FROM public.user_profiles_2025_09_27_12_14 up
WHERE up.user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000006'
)
ON CONFLICT (user_id) DO UPDATE SET
    current_points = EXCLUDED.current_points,
    total_earned = EXCLUDED.total_earned;

-- 생성된 계정 정보 확인
SELECT 
    up.username,
    up.full_name,
    up.user_id,
    sg.name as group_name,
    CASE 
        WHEN sg.leader_id = up.id THEN 'leader'
        ELSE 'member'
    END as role
FROM public.user_profiles_2025_09_27_12_14 up
LEFT JOIN public.group_memberships_2025_09_27_12_14 gm ON gm.user_id = up.id
LEFT JOIN public.study_groups_2025_09_27_12_14 sg ON sg.id = gm.group_id
WHERE up.user_id IN (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000006'
)
ORDER BY up.username;