-- 간단한 가상 데이터 생성

-- 1. 기존 테스트 데이터 정리
DELETE FROM public.user_profiles_2025_09_27_12_14 WHERE username LIKE 'test_%';

-- 2. 간단한 테스트 사용자 프로필 생성
INSERT INTO public.user_profiles_2025_09_27_12_14 (
    user_id, username, full_name, initial_capital, current_capital
) VALUES 
('11111111-1111-1111-1111-111111111111', 'admin', '시스템 관리자', 10000000, 12500000),
('22222222-2222-2222-2222-222222222222', 'testuser', '테스트 사용자', 10000000, 11200000),
('33333333-3333-3333-3333-333333333333', 'test_member1', '김투자', 10000000, 13800000),
('44444444-4444-4444-4444-444444444444', 'test_member2', '이수익', 10000000, 9500000),
('55555555-5555-5555-5555-555555555555', 'test_member3', '박성장', 10000000, 14200000);

-- 3. 간단한 참여도 데이터 생성
INSERT INTO public.participation_records_2025_09_27_12_14 (
    user_id, activity_type, activity_date, score, description
)
SELECT 
    (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'admin'),
    'meeting_attendance',
    CURRENT_DATE - INTERVAL '1 day',
    15,
    '주간 투자 회의 참석'
WHERE EXISTS (SELECT 1 FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'admin')

UNION ALL

SELECT 
    (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'testuser'),
    'portfolio_update',
    CURRENT_DATE - INTERVAL '2 days',
    12,
    '포트폴리오 업데이트'
WHERE EXISTS (SELECT 1 FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'testuser')

UNION ALL

SELECT 
    (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'test_member1'),
    'research_sharing',
    CURRENT_DATE - INTERVAL '3 days',
    18,
    '투자 분석 보고서 공유'
WHERE EXISTS (SELECT 1 FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'test_member1');

-- 4. 간단한 스터디 그룹 생성
INSERT INTO public.study_groups_2025_09_27_12_14 (name, description, leader_id)
SELECT 
    '불패 테스트팀',
    '테스트용 스터디 그룹',
    (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'admin' LIMIT 1)
WHERE EXISTS (SELECT 1 FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'admin');

-- 5. 그룹 멤버십 생성
INSERT INTO public.group_memberships_2025_09_27_12_14 (group_id, user_id)
SELECT 
    (SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 테스트팀' LIMIT 1),
    up.id
FROM public.user_profiles_2025_09_27_12_14 up
WHERE up.username IN ('admin', 'testuser', 'test_member1', 'test_member2', 'test_member3')
AND EXISTS (SELECT 1 FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 테스트팀');

-- 6. 생성된 데이터 확인
SELECT 
    '테스트 사용자' as 구분,
    COUNT(*) as 개수
FROM public.user_profiles_2025_09_27_12_14 
WHERE username IN ('admin', 'testuser') OR username LIKE 'test_%'

UNION ALL

SELECT 
    '테스트 그룹' as 구분,
    COUNT(*) as 개수
FROM public.study_groups_2025_09_27_12_14 
WHERE name = '불패 테스트팀'

UNION ALL

SELECT 
    '그룹 멤버' as 구분,
    COUNT(*) as 개수
FROM public.group_memberships_2025_09_27_12_14 gm
JOIN public.study_groups_2025_09_27_12_14 sg ON gm.group_id = sg.id
WHERE sg.name = '불패 테스트팀'

UNION ALL

SELECT 
    '참여도 기록' as 구분,
    COUNT(*) as 개수
FROM public.participation_records_2025_09_27_12_14 pr
JOIN public.user_profiles_2025_09_27_12_14 up ON pr.user_id = up.id
WHERE up.username IN ('admin', 'testuser', 'test_member1');