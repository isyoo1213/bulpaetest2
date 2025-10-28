-- 가상 데이터 생성 (UUID 타입 수정)

-- 1. 기존 테스트 데이터 정리
DELETE FROM public.group_memberships_2025_09_27_12_14 WHERE group_id IN (SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name LIKE '%불패%');
DELETE FROM public.study_groups_2025_09_27_12_14 WHERE name LIKE '%불패%';
DELETE FROM public.user_profiles_2025_09_27_12_14 WHERE username IN ('admin', 'testuser', 'member1', 'member2', 'member3', 'member4', 'member5', 'member6');

-- 2. 테스트 사용자 프로필 생성 (UUID 타입 사용)
INSERT INTO public.user_profiles_2025_09_27_12_14 (
    user_id, username, full_name, initial_capital, current_capital, created_at, updated_at
) VALUES 
-- 관리자
('11111111-1111-1111-1111-111111111111', 'admin', '시스템 관리자', 10000000, 12500000, NOW(), NOW()),
-- 일반 사용자
('22222222-2222-2222-2222-222222222222', 'testuser', '테스트 사용자', 10000000, 11200000, NOW(), NOW()),
-- 추가 팀원들
('33333333-3333-3333-3333-333333333333', 'member1', '김투자', 10000000, 13800000, NOW(), NOW()),
('44444444-4444-4444-4444-444444444444', 'member2', '이수익', 10000000, 9500000, NOW(), NOW()),
('55555555-5555-5555-5555-555555555555', 'member3', '박성장', 10000000, 14200000, NOW(), NOW()),
('66666666-6666-6666-6666-666666666666', 'member4', '최분석', 10000000, 8900000, NOW(), NOW()),
('77777777-7777-7777-7777-777777777777', 'member5', '정전략', 10000000, 15600000, NOW(), NOW()),
('88888888-8888-8888-8888-888888888888', 'member6', '한안정', 10000000, 10800000, NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    current_capital = EXCLUDED.current_capital,
    updated_at = NOW();

-- 3. 생성된 프로필 ID 조회를 위한 임시 테이블
CREATE TEMP TABLE temp_user_ids AS
SELECT id, user_id, username FROM public.user_profiles_2025_09_27_12_14 
WHERE username IN ('admin', 'testuser', 'member1', 'member2', 'member3', 'member4', 'member5', 'member6');

-- 4. 테스트 스터디 그룹 생성
DO $$
DECLARE
    admin_profile_id INTEGER;
    member1_profile_id INTEGER;
    member5_profile_id INTEGER;
    group_a_id INTEGER;
    group_b_id INTEGER;
    group_c_id INTEGER;
BEGIN
    -- 프로필 ID 조회
    SELECT id INTO admin_profile_id FROM temp_user_ids WHERE username = 'admin';
    SELECT id INTO member1_profile_id FROM temp_user_ids WHERE username = 'member1';
    SELECT id INTO member5_profile_id FROM temp_user_ids WHERE username = 'member5';
    
    -- 그룹 생성
    INSERT INTO public.study_groups_2025_09_27_12_14 (name, description, leader_id, created_at, updated_at)
    VALUES 
    ('불패 A팀', '공격적 성장 투자 전략팀', admin_profile_id, NOW(), NOW()),
    ('불패 B팀', '안정적 가치 투자 전략팀', member1_profile_id, NOW(), NOW()),
    ('불패 C팀', '균형잡힌 포트폴리오 팀', member5_profile_id, NOW(), NOW());
    
    -- 생성된 그룹 ID 조회
    SELECT id INTO group_a_id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀';
    SELECT id INTO group_b_id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 B팀';
    SELECT id INTO group_c_id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 C팀';
    
    -- 그룹 멤버십 생성
    INSERT INTO public.group_memberships_2025_09_27_12_14 (group_id, user_id, joined_at)
    SELECT group_a_id, id, NOW() FROM temp_user_ids WHERE username IN ('admin', 'testuser', 'member1')
    UNION ALL
    SELECT group_b_id, id, NOW() FROM temp_user_ids WHERE username IN ('member2', 'member3', 'member4')
    UNION ALL
    SELECT group_c_id, id, NOW() FROM temp_user_ids WHERE username IN ('member5', 'member6');
    
END $$;

-- 5. 참여도 데이터 생성
INSERT INTO public.participation_records_2025_09_27_12_14 (
    user_id, activity_type, activity_date, score, description, created_at
)
SELECT 
    t.id,
    CASE 
        WHEN t.username = 'admin' THEN 'meeting_attendance'
        WHEN t.username = 'testuser' THEN 'portfolio_update'
        WHEN t.username = 'member1' THEN 'research_sharing'
        WHEN t.username = 'member2' THEN 'discussion_participation'
        WHEN t.username = 'member3' THEN 'meeting_attendance'
        ELSE 'peer_feedback'
    END,
    CURRENT_DATE - INTERVAL '7 days',
    CASE 
        WHEN t.username = 'admin' THEN 15
        WHEN t.username = 'testuser' THEN 12
        WHEN t.username = 'member1' THEN 18
        WHEN t.username = 'member2' THEN 9
        WHEN t.username = 'member3' THEN 14
        ELSE 10
    END,
    '주간 활동 참여',
    NOW()
FROM temp_user_ids t
ON CONFLICT DO NOTHING;

-- 6. 포인트 시스템 초기화
INSERT INTO public.user_points_2025_09_28_06_00 (
    user_id, current_points, total_earned, total_spent, created_at, updated_at
)
SELECT 
    t.id,
    1000 + (RANDOM() * 500)::INTEGER,
    1500 + (RANDOM() * 1000)::INTEGER,
    (RANDOM() * 500)::INTEGER,
    NOW(),
    NOW()
FROM temp_user_ids t
ON CONFLICT (user_id) DO UPDATE SET
    current_points = EXCLUDED.current_points,
    total_earned = EXCLUDED.total_earned,
    total_spent = EXCLUDED.total_spent,
    updated_at = NOW();

-- 7. 생성된 데이터 확인
SELECT 
    '생성된 사용자 프로필' as 구분,
    COUNT(*) as 개수,
    STRING_AGG(username, ', ') as 사용자목록
FROM public.user_profiles_2025_09_27_12_14 
WHERE username IN ('admin', 'testuser', 'member1', 'member2', 'member3', 'member4', 'member5', 'member6')

UNION ALL

SELECT 
    '생성된 스터디 그룹' as 구분,
    COUNT(*) as 개수,
    STRING_AGG(name, ', ') as 그룹목록
FROM public.study_groups_2025_09_27_12_14 
WHERE name LIKE '불패%팀'

UNION ALL

SELECT 
    '생성된 그룹 멤버십' as 구분,
    COUNT(*) as 개수,
    '팀별 멤버 배정 완료' as 상세
FROM public.group_memberships_2025_09_27_12_14 gm
JOIN public.study_groups_2025_09_27_12_14 sg ON gm.group_id = sg.id
WHERE sg.name LIKE '불패%팀'

UNION ALL

SELECT 
    '생성된 참여도 기록' as 구분,
    COUNT(*) as 개수,
    '주간 활동 데이터' as 상세
FROM public.participation_records_2025_09_27_12_14 pr
JOIN temp_user_ids t ON pr.user_id = t.id

UNION ALL

SELECT 
    '생성된 포인트 데이터' as 구분,
    COUNT(*) as 개수,
    '포인트 시스템 초기화' as 상세
FROM public.user_points_2025_09_28_06_00 up
JOIN temp_user_ids t ON up.user_id = t.id;