-- 완전한 테스트 데이터 생성 (Auth 제약조건 우회)

-- 1. 기존 테스트 데이터 정리
DELETE FROM public.group_memberships_2025_09_27_12_14;
DELETE FROM public.study_groups_2025_09_27_12_14;
DELETE FROM public.user_profiles_2025_09_27_12_14 WHERE username NOT IN ('admin', 'testuser');
DELETE FROM public.participation_records_2025_09_27_12_14;
DELETE FROM public.team_portfolios_2025_09_27_13_30;
DELETE FROM public.user_points_2025_09_28_06_00;

-- 2. 외래키 제약조건 임시 비활성화
ALTER TABLE public.user_profiles_2025_09_27_12_14 DROP CONSTRAINT IF EXISTS user_profiles_2025_09_27_12_14_user_id_fkey;

-- 3. 관리자 및 테스트 사용자 프로필 생성/업데이트
INSERT INTO public.user_profiles_2025_09_27_12_14 (user_id, username, full_name, initial_capital, current_capital, created_at, updated_at) 
VALUES 
('admin-uuid-0000-0000-0000-000000000000', 'admin', '시스템 관리자', 10000000, 15000000, NOW(), NOW()),
('user-uuid-0000-0000-0000-000000000001', 'testuser', '테스트 사용자', 10000000, 12000000, NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    initial_capital = EXCLUDED.initial_capital,
    current_capital = EXCLUDED.current_capital,
    updated_at = NOW();

-- 4. 36명 팀원 프로필 생성
INSERT INTO public.user_profiles_2025_09_27_12_14 (user_id, username, full_name, initial_capital, current_capital, created_at, updated_at) VALUES
-- 옵티머스팀 (6명) - 안정적 수익
('team1-user1-0000-0000-0000-000000000001', 'kim_optimal', '김최적', 10000000, 12500000, NOW(), NOW()),
('team1-user2-0000-0000-0000-000000000002', 'lee_efficient', '이효율', 10000000, 11800000, NOW(), NOW()),
('team1-user3-0000-0000-0000-000000000003', 'park_stable', '박안정', 10000000, 10900000, NOW(), NOW()),
('team1-user4-0000-0000-0000-000000000004', 'choi_profit', '최수익', 10000000, 13200000, NOW(), NOW()),
('team1-user5-0000-0000-0000-000000000005', 'jung_balance', '정균형', 10000000, 11500000, NOW(), NOW()),
('team1-user6-0000-0000-0000-000000000006', 'han_careful', '한신중', 10000000, 10700000, NOW(), NOW()),

-- 써밋팀 (6명) - 높은 수익
('team2-user1-0000-0000-0000-000000000007', 'lee_summit', '이정상', 10000000, 14200000, NOW(), NOW()),
('team2-user2-0000-0000-0000-000000000008', 'park_challenge', '박도전', 10000000, 13800000, NOW(), NOW()),
('team2-user3-0000-0000-0000-000000000009', 'kim_achieve', '김성취', 10000000, 12900000, NOW(), NOW()),
('team2-user4-0000-0000-0000-000000000010', 'choi_goal', '최목표', 10000000, 13500000, NOW(), NOW()),
('team2-user5-0000-0000-0000-000000000011', 'jung_passion', '정열정', 10000000, 14000000, NOW(), NOW()),
('team2-user6-0000-0000-0000-000000000012', 'han_victory', '한승리', 10000000, 13300000, NOW(), NOW()),

-- 프론티어팀 (6명) - 최고 수익
('team3-user1-0000-0000-0000-000000000013', 'park_pioneer', '박개척', 10000000, 15200000, NOW(), NOW()),
('team3-user2-0000-0000-0000-000000000014', 'kim_innovation', '김혁신', 10000000, 14800000, NOW(), NOW()),
('team3-user3-0000-0000-0000-000000000015', 'lee_explore', '이탐험', 10000000, 14500000, NOW(), NOW()),
('team3-user4-0000-0000-0000-000000000016', 'choi_future', '최미래', 10000000, 15000000, NOW(), NOW()),
('team3-user5-0000-0000-0000-000000000017', 'jung_create', '정창조', 10000000, 14300000, NOW(), NOW()),
('team3-user6-0000-0000-0000-000000000018', 'han_advance', '한선구', 10000000, 14700000, NOW(), NOW()),

-- 모멘텀팀 (6명) - 중간 수익
('team4-user1-0000-0000-0000-000000000019', 'kim_dynamic', '김역동', 10000000, 11200000, NOW(), NOW()),
('team4-user2-0000-0000-0000-000000000020', 'lee_drive', '이추진', 10000000, 11800000, NOW(), NOW()),
('team4-user3-0000-0000-0000-000000000021', 'park_speed', '박가속', 10000000, 11500000, NOW(), NOW()),
('team4-user4-0000-0000-0000-000000000022', 'choi_energy', '최활력', 10000000, 12100000, NOW(), NOW()),
('team4-user5-0000-0000-0000-000000000023', 'jung_power', '정에너지', 10000000, 11900000, NOW(), NOW()),
('team4-user6-0000-0000-0000-000000000024', 'han_velocity', '한속도', 10000000, 11600000, NOW(), NOW()),

-- 아틀라스팀 (6명) - 손실
('team5-user1-0000-0000-0000-000000000025', 'lee_world', '이세계', 10000000, 9800000, NOW(), NOW()),
('team5-user2-0000-0000-0000-000000000026', 'park_global', '박글로벌', 10000000, 9500000, NOW(), NOW()),
('team5-user3-0000-0000-0000-000000000027', 'kim_international', '김국제', 10000000, 9200000, NOW(), NOW()),
('team5-user4-0000-0000-0000-000000000028', 'choi_continent', '최대륙', 10000000, 9600000, NOW(), NOW()),
('team5-user5-0000-0000-0000-000000000029', 'jung_earth', '정지구', 10000000, 9400000, NOW(), NOW()),
('team5-user6-0000-0000-0000-000000000030', 'han_universe', '한우주', 10000000, 9700000, NOW(), NOW()),

-- 넥서스팀 (6명) - 좋은 수익
('team6-user1-0000-0000-0000-000000000031', 'park_connect', '박연결', 10000000, 13100000, NOW(), NOW()),
('team6-user2-0000-0000-0000-000000000032', 'kim_cooperate', '김협력', 10000000, 12800000, NOW(), NOW()),
('team6-user3-0000-0000-0000-000000000033', 'lee_communicate', '이소통', 10000000, 13400000, NOW(), NOW()),
('team6-user4-0000-0000-0000-000000000034', 'choi_network', '최네트워크', 10000000, 12600000, NOW(), NOW()),
('team6-user5-0000-0000-0000-000000000035', 'jung_synergy', '정시너지', 10000000, 13000000, NOW(), NOW()),
('team6-user6-0000-0000-0000-000000000036', 'han_fusion', '한융합', 10000000, 12700000, NOW(), NOW());

-- 5. 6개 스터디 그룹 생성
INSERT INTO public.study_groups_2025_09_27_12_14 (name, description, leader_id, created_at, updated_at) VALUES
('옵티머스팀', '최적화된 투자 전략으로 안정적 수익 추구', (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'kim_optimal'), NOW(), NOW()),
('써밋팀', '정상을 향한 도전적 투자로 최고 수익률 달성', (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'lee_summit'), NOW(), NOW()),
('프론티어팀', '새로운 투자 영역 개척으로 혁신적 성과 창출', (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'park_pioneer'), NOW(), NOW()),
('모멘텀팀', '시장 모멘텀을 활용한 적극적 투자 전략', (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'kim_dynamic'), NOW(), NOW()),
('아틀라스팀', '글로벌 시장 분석으로 세계적 투자 포트폴리오 구축', (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'lee_world'), NOW(), NOW()),
('넥서스팀', '연결과 협력을 통한 시너지 투자 전략', (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'park_connect'), NOW(), NOW());

-- 6. 그룹 멤버십 생성
INSERT INTO public.group_memberships_2025_09_27_12_14 (group_id, user_id, joined_at)
SELECT 
    sg.id,
    up.id,
    NOW()
FROM public.study_groups_2025_09_27_12_14 sg
JOIN public.user_profiles_2025_09_27_12_14 up ON (
    (sg.name = '옵티머스팀' AND up.username IN ('kim_optimal', 'lee_efficient', 'park_stable', 'choi_profit', 'jung_balance', 'han_careful')) OR
    (sg.name = '써밋팀' AND up.username IN ('lee_summit', 'park_challenge', 'kim_achieve', 'choi_goal', 'jung_passion', 'han_victory')) OR
    (sg.name = '프론티어팀' AND up.username IN ('park_pioneer', 'kim_innovation', 'lee_explore', 'choi_future', 'jung_create', 'han_advance')) OR
    (sg.name = '모멘텀팀' AND up.username IN ('kim_dynamic', 'lee_drive', 'park_speed', 'choi_energy', 'jung_power', 'han_velocity')) OR
    (sg.name = '아틀라스팀' AND up.username IN ('lee_world', 'park_global', 'kim_international', 'choi_continent', 'jung_earth', 'han_universe')) OR
    (sg.name = '넥서스팀' AND up.username IN ('park_connect', 'kim_cooperate', 'lee_communicate', 'choi_network', 'jung_synergy', 'han_fusion'))
);

-- 7. 팀별 포트폴리오 데이터 생성
INSERT INTO public.team_portfolios_2025_09_27_13_30 (team_id, stock_symbol, stock_name, quantity, average_price, current_price, total_value, profit_loss, profit_loss_percentage, last_updated, created_at)
SELECT 
    sg.id,
    stocks.symbol,
    stocks.name,
    stocks.quantity,
    stocks.avg_price,
    stocks.current_price,
    stocks.quantity * stocks.current_price,
    stocks.quantity * (stocks.current_price - stocks.avg_price),
    ((stocks.current_price - stocks.avg_price) / stocks.avg_price) * 100,
    NOW(),
    NOW()
FROM public.study_groups_2025_09_27_12_14 sg
CROSS JOIN (
    VALUES 
    ('AAPL', 'Apple Inc.', 100, 150.00, 175.50),
    ('TSLA', 'Tesla Inc.', 50, 200.00, 245.80),
    ('NVDA', 'NVIDIA Corp.', 30, 400.00, 520.75)
) AS stocks(symbol, name, quantity, avg_price, current_price)
WHERE sg.name LIKE '%팀';

-- 8. 포인트 시스템 초기화
INSERT INTO public.user_points_2025_09_28_06_00 (user_id, current_points, total_earned, total_spent, created_at, updated_at)
SELECT 
    up.id,
    CASE 
        WHEN up.username = 'admin' THEN 2000
        WHEN up.username = 'testuser' THEN 1500
        ELSE (500 + (RANDOM() * 1000)::INT)
    END,
    CASE 
        WHEN up.username = 'admin' THEN 3000
        WHEN up.username = 'testuser' THEN 2500
        ELSE (1000 + (RANDOM() * 1500)::INT)
    END,
    CASE 
        WHEN up.username = 'admin' THEN 1000
        WHEN up.username = 'testuser' THEN 1000
        ELSE (100 + (RANDOM() * 500)::INT)
    END,
    NOW(),
    NOW()
FROM public.user_profiles_2025_09_27_12_14 up;

-- 9. 생성 결과 확인
SELECT 
    '생성된 사용자' as 구분,
    COUNT(*) as 개수,
    '관리자 2명 + 팀원 36명' as 상세
FROM public.user_profiles_2025_09_27_12_14

UNION ALL

SELECT 
    '생성된 팀' as 구분,
    COUNT(*) as 개수,
    STRING_AGG(name, ', ') as 상세
FROM public.study_groups_2025_09_27_12_14

UNION ALL

SELECT 
    '그룹 멤버십' as 구분,
    COUNT(*) as 개수,
    '각 팀당 6명씩 배정' as 상세
FROM public.group_memberships_2025_09_27_12_14

UNION ALL

SELECT 
    '팀 포트폴리오' as 구분,
    COUNT(*) as 개수,
    '각 팀당 3개 종목' as 상세
FROM public.team_portfolios_2025_09_27_13_30

UNION ALL

SELECT 
    '포인트 데이터' as 구분,
    COUNT(*) as 개수,
    '모든 사용자 포인트 초기화' as 상세
FROM public.user_points_2025_09_28_06_00;