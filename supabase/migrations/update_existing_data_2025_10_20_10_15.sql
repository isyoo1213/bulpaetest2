-- 기존 사용자 데이터 업데이트 및 가상 데이터 추가

-- 1. 현재 존재하는 사용자 확인
SELECT 
    'Auth 사용자' as 구분,
    COUNT(*) as 개수,
    STRING_AGG(email, ', ') as 이메일목록
FROM auth.users;

-- 2. 현재 존재하는 프로필 확인
SELECT 
    '프로필 사용자' as 구분,
    COUNT(*) as 개수,
    STRING_AGG(username, ', ') as 사용자명목록
FROM public.user_profiles_2025_09_27_12_14;

-- 3. 기존 프로필 데이터 업데이트 (있다면)
UPDATE public.user_profiles_2025_09_27_12_14 
SET 
    initial_capital = 10000000,
    current_capital = CASE 
        WHEN username = 'admin' THEN 12500000
        WHEN username = 'testuser' THEN 11200000
        ELSE current_capital
    END,
    updated_at = NOW()
WHERE username IN ('admin', 'testuser');

-- 4. 가상 참여도 데이터 생성 (기존 사용자용)
INSERT INTO public.participation_records_2025_09_27_12_14 (
    user_id, activity_type, activity_date, score, description, created_at
)
SELECT 
    up.id,
    'meeting_attendance',
    CURRENT_DATE - INTERVAL '1 day',
    15,
    '주간 투자 회의 참석',
    NOW()
FROM public.user_profiles_2025_09_27_12_14 up
WHERE up.username = 'admin'
AND NOT EXISTS (
    SELECT 1 FROM public.participation_records_2025_09_27_12_14 pr 
    WHERE pr.user_id = up.id AND pr.activity_date = CURRENT_DATE - INTERVAL '1 day'
)

UNION ALL

SELECT 
    up.id,
    'portfolio_update',
    CURRENT_DATE - INTERVAL '2 days',
    12,
    '포트폴리오 업데이트',
    NOW()
FROM public.user_profiles_2025_09_27_12_14 up
WHERE up.username = 'testuser'
AND NOT EXISTS (
    SELECT 1 FROM public.participation_records_2025_09_27_12_14 pr 
    WHERE pr.user_id = up.id AND pr.activity_date = CURRENT_DATE - INTERVAL '2 days'
)

UNION ALL

SELECT 
    up.id,
    'research_sharing',
    CURRENT_DATE - INTERVAL '3 days',
    18,
    'NVIDIA 분석 보고서 공유',
    NOW()
FROM public.user_profiles_2025_09_27_12_14 up
WHERE up.username = 'admin'
AND NOT EXISTS (
    SELECT 1 FROM public.participation_records_2025_09_27_12_14 pr 
    WHERE pr.user_id = up.id AND pr.activity_date = CURRENT_DATE - INTERVAL '3 days'
)

UNION ALL

SELECT 
    up.id,
    'discussion_participation',
    CURRENT_DATE - INTERVAL '4 days',
    10,
    '투자 전략 토론 참여',
    NOW()
FROM public.user_profiles_2025_09_27_12_14 up
WHERE up.username = 'testuser'
AND NOT EXISTS (
    SELECT 1 FROM public.participation_records_2025_09_27_12_14 pr 
    WHERE pr.user_id = up.id AND pr.activity_date = CURRENT_DATE - INTERVAL '4 days'
)

UNION ALL

SELECT 
    up.id,
    'peer_feedback',
    CURRENT_DATE - INTERVAL '5 days',
    8,
    '동료 피드백 제공',
    NOW()
FROM public.user_profiles_2025_09_27_12_14 up
WHERE up.username = 'admin'
AND NOT EXISTS (
    SELECT 1 FROM public.participation_records_2025_09_27_12_14 pr 
    WHERE pr.user_id = up.id AND pr.activity_date = CURRENT_DATE - INTERVAL '5 days'
);

-- 5. 가상 스터디 그룹 생성
INSERT INTO public.study_groups_2025_09_27_12_14 (name, description, leader_id, created_at, updated_at)
SELECT 
    '불패 테스트팀',
    '테스트용 스터디 그룹 - 공격적 성장 투자 전략',
    up.id,
    NOW(),
    NOW()
FROM public.user_profiles_2025_09_27_12_14 up
WHERE up.username = 'admin'
AND NOT EXISTS (
    SELECT 1 FROM public.study_groups_2025_09_27_12_14 
    WHERE name = '불패 테스트팀'
);

-- 6. 그룹 멤버십 생성
INSERT INTO public.group_memberships_2025_09_27_12_14 (group_id, user_id, joined_at)
SELECT 
    sg.id,
    up.id,
    NOW()
FROM public.study_groups_2025_09_27_12_14 sg
CROSS JOIN public.user_profiles_2025_09_27_12_14 up
WHERE sg.name = '불패 테스트팀'
AND up.username IN ('admin', 'testuser')
AND NOT EXISTS (
    SELECT 1 FROM public.group_memberships_2025_09_27_12_14 gm
    WHERE gm.group_id = sg.id AND gm.user_id = up.id
);

-- 7. 포인트 시스템 초기화
INSERT INTO public.user_points_2025_09_28_06_00 (
    user_id, current_points, total_earned, total_spent, created_at, updated_at
)
SELECT 
    up.id,
    CASE 
        WHEN up.username = 'admin' THEN 1500
        WHEN up.username = 'testuser' THEN 1200
        ELSE 1000
    END,
    CASE 
        WHEN up.username = 'admin' THEN 2000
        WHEN up.username = 'testuser' THEN 1800
        ELSE 1500
    END,
    CASE 
        WHEN up.username = 'admin' THEN 500
        WHEN up.username = 'testuser' THEN 600
        ELSE 500
    END,
    NOW(),
    NOW()
FROM public.user_profiles_2025_09_27_12_14 up
WHERE up.username IN ('admin', 'testuser')
AND NOT EXISTS (
    SELECT 1 FROM public.user_points_2025_09_28_06_00 pt
    WHERE pt.user_id = up.id
);

-- 8. 가상 투자 기록 생성 (팀 포트폴리오용)
INSERT INTO public.team_portfolios_2025_09_27_13_30 (
    team_id, stock_symbol, stock_name, quantity, average_price, current_price, 
    total_value, profit_loss, profit_loss_percentage, last_updated, created_at
)
SELECT 
    sg.id,
    'AAPL',
    'Apple Inc.',
    100,
    150.00,
    175.50,
    17550.00,
    2550.00,
    17.00,
    NOW(),
    NOW()
FROM public.study_groups_2025_09_27_12_14 sg
WHERE sg.name = '불패 테스트팀'
AND NOT EXISTS (
    SELECT 1 FROM public.team_portfolios_2025_09_27_13_30 tp
    WHERE tp.team_id = sg.id AND tp.stock_symbol = 'AAPL'
)

UNION ALL

SELECT 
    sg.id,
    'TSLA',
    'Tesla Inc.',
    50,
    200.00,
    245.80,
    12290.00,
    2290.00,
    22.90,
    NOW(),
    NOW()
FROM public.study_groups_2025_09_27_12_14 sg
WHERE sg.name = '불패 테스트팀'
AND NOT EXISTS (
    SELECT 1 FROM public.team_portfolios_2025_09_27_13_30 tp
    WHERE tp.team_id = sg.id AND tp.stock_symbol = 'TSLA'
)

UNION ALL

SELECT 
    sg.id,
    'NVDA',
    'NVIDIA Corp.',
    30,
    400.00,
    520.75,
    15622.50,
    3622.50,
    30.19,
    NOW(),
    NOW()
FROM public.study_groups_2025_09_27_12_14 sg
WHERE sg.name = '불패 테스트팀'
AND NOT EXISTS (
    SELECT 1 FROM public.team_portfolios_2025_09_27_13_30 tp
    WHERE tp.team_id = sg.id AND tp.stock_symbol = 'NVDA'
);

-- 9. 생성된 데이터 확인
SELECT 
    '업데이트된 프로필' as 구분,
    COUNT(*) as 개수,
    STRING_AGG(username || '(' || current_capital::text || '원)', ', ') as 상세
FROM public.user_profiles_2025_09_27_12_14 
WHERE username IN ('admin', 'testuser')

UNION ALL

SELECT 
    '생성된 참여도 기록' as 구분,
    COUNT(*) as 개수,
    '최근 5일간 활동 데이터' as 상세
FROM public.participation_records_2025_09_27_12_14 pr
JOIN public.user_profiles_2025_09_27_12_14 up ON pr.user_id = up.id
WHERE up.username IN ('admin', 'testuser')

UNION ALL

SELECT 
    '생성된 스터디 그룹' as 구분,
    COUNT(*) as 개수,
    name as 상세
FROM public.study_groups_2025_09_27_12_14 
WHERE name = '불패 테스트팀'

UNION ALL

SELECT 
    '그룹 멤버십' as 구분,
    COUNT(*) as 개수,
    '팀 멤버 배정 완료' as 상세
FROM public.group_memberships_2025_09_27_12_14 gm
JOIN public.study_groups_2025_09_27_12_14 sg ON gm.group_id = sg.id
WHERE sg.name = '불패 테스트팀'

UNION ALL

SELECT 
    '포인트 데이터' as 구분,
    COUNT(*) as 개수,
    '포인트 시스템 초기화' as 상세
FROM public.user_points_2025_09_28_06_00 pt
JOIN public.user_profiles_2025_09_27_12_14 up ON pt.user_id = up.id
WHERE up.username IN ('admin', 'testuser')

UNION ALL

SELECT 
    '팀 포트폴리오' as 구분,
    COUNT(*) as 개수,
    STRING_AGG(stock_symbol, ', ') as 상세
FROM public.team_portfolios_2025_09_27_13_30 tp
JOIN public.study_groups_2025_09_27_12_14 sg ON tp.team_id = sg.id
WHERE sg.name = '불패 테스트팀';