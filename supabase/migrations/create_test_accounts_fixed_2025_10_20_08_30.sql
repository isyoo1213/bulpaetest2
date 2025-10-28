-- 테스트 계정용 사용자 프로필 생성 (수정버전)

-- 기존 테스트 데이터 정리
DELETE FROM public.group_memberships_2025_09_27_12_14 
WHERE group_id IN (
    SELECT id FROM public.study_groups_2025_09_27_12_14 
    WHERE name = '테스트 스터디 그룹'
);

DELETE FROM public.study_groups_2025_09_27_12_14 
WHERE name = '테스트 스터디 그룹';

DELETE FROM public.user_profiles_2025_09_27_12_14 
WHERE username IN ('admin', 'testuser', 'member1', 'member2', 'member3', 'member4');

-- 관리자 계정 프로필 생성
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
);

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
);

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
    ('00000000-0000-0000-0000-000000000006', 'member4', '최리스크', 10000000, 10000000);

-- 테스트 그룹 생성 (관리자가 리더)
INSERT INTO public.study_groups_2025_09_27_12_14 (
    name,
    description,
    leader_id
) VALUES (
    '테스트 스터디 그룹',
    '시스템 테스트를 위한 샘플 그룹입니다',
    (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'admin')
);

-- 그룹 멤버십 생성
INSERT INTO public.group_memberships_2025_09_27_12_14 (
    group_id,
    user_id
) 
SELECT 
    sg.id,
    up.id
FROM public.study_groups_2025_09_27_12_14 sg,
     public.user_profiles_2025_09_27_12_14 up
WHERE sg.name = '테스트 스터디 그룹'
  AND up.username IN ('admin', 'testuser', 'member1', 'member2', 'member3', 'member4');

-- 팀 설정 생성
INSERT INTO public.team_settings_2025_10_20_08_10 (
    group_id,
    team_color,
    team_slogan,
    team_goal
) 
SELECT 
    sg.id,
    '#3B82F6',
    '완벽한 시스템 테스트',
    '새로운 평가시스템의 모든 기능을 완벽하게 테스트하여 최고의 사용자 경험을 제공합니다'
FROM public.study_groups_2025_09_27_12_14 sg
WHERE sg.name = '테스트 스터디 그룹';

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
WHERE up.username IN ('admin', 'testuser', 'member1', 'member2', 'member3', 'member4');

-- 생성된 계정 정보 확인
SELECT 
    up.username,
    up.full_name,
    up.user_id,
    sg.name as group_name,
    CASE 
        WHEN sg.leader_id = up.id THEN 'leader/admin'
        ELSE 'member'
    END as role
FROM public.user_profiles_2025_09_27_12_14 up
LEFT JOIN public.group_memberships_2025_09_27_12_14 gm ON gm.user_id = up.id
LEFT JOIN public.study_groups_2025_09_27_12_14 sg ON sg.id = gm.group_id
WHERE up.username IN ('admin', 'testuser', 'member1', 'member2', 'member3', 'member4')
ORDER BY up.username;