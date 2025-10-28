-- 36명 가상 인물과 6개 팀 완전 테스트 데이터 생성

-- 1. 기존 테스트 데이터 정리
DELETE FROM public.group_memberships_2025_09_27_12_14 WHERE group_id IN (
  SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name LIKE '%팀'
);
DELETE FROM public.study_groups_2025_09_27_12_14 WHERE name LIKE '%팀';
DELETE FROM public.user_profiles_2025_09_27_12_14 WHERE username NOT IN ('admin', 'testuser');

-- 2. 36명 사용자 프로필 생성 (UUID 형식으로)
INSERT INTO public.user_profiles_2025_09_27_12_14 (user_id, username, full_name, initial_capital, current_capital, created_at, updated_at) VALUES
-- 옵티머스팀 (6명)
('01010000-0000-0000-0000-000000000001', 'kim_optimal', '김최적', 10000000, 12500000, NOW(), NOW()),
('01020000-0000-0000-0000-000000000002', 'lee_efficient', '이효율', 10000000, 11800000, NOW(), NOW()),
('01030000-0000-0000-0000-000000000003', 'park_stable', '박안정', 10000000, 10900000, NOW(), NOW()),
('01040000-0000-0000-0000-000000000004', 'choi_profit', '최수익', 10000000, 13200000, NOW(), NOW()),
('01050000-0000-0000-0000-000000000005', 'jung_balance', '정균형', 10000000, 11500000, NOW(), NOW()),
('01060000-0000-0000-0000-000000000006', 'han_careful', '한신중', 10000000, 10700000, NOW(), NOW()),

-- 써밋팀 (6명)
('02010000-0000-0000-0000-000000000007', 'lee_summit', '이정상', 10000000, 14200000, NOW(), NOW()),
('02020000-0000-0000-0000-000000000008', 'park_challenge', '박도전', 10000000, 13800000, NOW(), NOW()),
('02030000-0000-0000-0000-000000000009', 'kim_achieve', '김성취', 10000000, 12900000, NOW(), NOW()),
('02040000-0000-0000-0000-000000000010', 'choi_goal', '최목표', 10000000, 13500000, NOW(), NOW()),
('02050000-0000-0000-0000-000000000011', 'jung_passion', '정열정', 10000000, 14000000, NOW(), NOW()),
('02060000-0000-0000-0000-000000000012', 'han_victory', '한승리', 10000000, 13300000, NOW(), NOW()),

-- 프론티어팀 (6명)
('03010000-0000-0000-0000-000000000013', 'park_pioneer', '박개척', 10000000, 15200000, NOW(), NOW()),
('03020000-0000-0000-0000-000000000014', 'kim_innovation', '김혁신', 10000000, 14800000, NOW(), NOW()),
('03030000-0000-0000-0000-000000000015', 'lee_explore', '이탐험', 10000000, 14500000, NOW(), NOW()),
('03040000-0000-0000-0000-000000000016', 'choi_future', '최미래', 10000000, 15000000, NOW(), NOW()),
('03050000-0000-0000-0000-000000000017', 'jung_create', '정창조', 10000000, 14300000, NOW(), NOW()),
('03060000-0000-0000-0000-000000000018', 'han_advance', '한선구', 10000000, 14700000, NOW(), NOW()),

-- 모멘텀팀 (6명)
('04010000-0000-0000-0000-000000000019', 'kim_dynamic', '김역동', 10000000, 11200000, NOW(), NOW()),
('04020000-0000-0000-0000-000000000020', 'lee_drive', '이추진', 10000000, 11800000, NOW(), NOW()),
('04030000-0000-0000-0000-000000000021', 'park_speed', '박가속', 10000000, 11500000, NOW(), NOW()),
('04040000-0000-0000-0000-000000000022', 'choi_energy', '최활력', 10000000, 12100000, NOW(), NOW()),
('04050000-0000-0000-0000-000000000023', 'jung_power', '정에너지', 10000000, 11900000, NOW(), NOW()),
('04060000-0000-0000-0000-000000000024', 'han_velocity', '한속도', 10000000, 11600000, NOW(), NOW()),

-- 아틀라스팀 (6명)
('05010000-0000-0000-0000-000000000025', 'lee_world', '이세계', 10000000, 9800000, NOW(), NOW()),
('05020000-0000-0000-0000-000000000026', 'park_global', '박글로벌', 10000000, 9500000, NOW(), NOW()),
('05030000-0000-0000-0000-000000000027', 'kim_international', '김국제', 10000000, 9200000, NOW(), NOW()),
('05040000-0000-0000-0000-000000000028', 'choi_continent', '최대륙', 10000000, 9600000, NOW(), NOW()),
('05050000-0000-0000-0000-000000000029', 'jung_earth', '정지구', 10000000, 9400000, NOW(), NOW()),
('05060000-0000-0000-0000-000000000030', 'han_universe', '한우주', 10000000, 9700000, NOW(), NOW()),

-- 넥서스팀 (6명)
('06010000-0000-0000-0000-000000000031', 'park_connect', '박연결', 10000000, 13100000, NOW(), NOW()),
('06020000-0000-0000-0000-000000000032', 'kim_cooperate', '김협력', 10000000, 12800000, NOW(), NOW()),
('06030000-0000-0000-0000-000000000033', 'lee_communicate', '이소통', 10000000, 13400000, NOW(), NOW()),
('06040000-0000-0000-0000-000000000034', 'choi_network', '최네트워크', 10000000, 12600000, NOW(), NOW()),
('06050000-0000-0000-0000-000000000035', 'jung_synergy', '정시너지', 10000000, 13000000, NOW(), NOW()),
('06060000-0000-0000-0000-000000000036', 'han_fusion', '한융합', 10000000, 12700000, NOW(), NOW());

-- 3. 6개 스터디 그룹 생성
INSERT INTO public.study_groups_2025_09_27_12_14 (name, description, leader_id, created_at, updated_at) VALUES
('옵티머스팀', '최적화된 투자 전략으로 안정적 수익 추구', (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'kim_optimal'), NOW(), NOW()),
('써밋팀', '정상을 향한 도전적 투자로 최고 수익률 달성', (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'lee_summit'), NOW(), NOW()),
('프론티어팀', '새로운 투자 영역 개척으로 혁신적 성과 창출', (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'park_pioneer'), NOW(), NOW()),
('모멘텀팀', '시장 모멘텀을 활용한 적극적 투자 전략', (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'kim_dynamic'), NOW(), NOW()),
('아틀라스팀', '글로벌 시장 분석으로 세계적 투자 포트폴리오 구축', (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'lee_world'), NOW(), NOW()),
('넥서스팀', '연결과 협력을 통한 시너지 투자 전략', (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'park_connect'), NOW(), NOW());

-- 4. 그룹 멤버십 생성
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

-- 5. 참여도 데이터 생성 (최근 7일간)
INSERT INTO public.participation_records_2025_09_27_12_14 (user_id, activity_type, activity_date, score, description, created_at)
SELECT 
    up.id,
    CASE (RANDOM() * 5)::INT
        WHEN 0 THEN 'meeting_attendance'
        WHEN 1 THEN 'portfolio_update'
        WHEN 2 THEN 'research_sharing'
        WHEN 3 THEN 'discussion_participation'
        ELSE 'peer_feedback'
    END,
    CURRENT_DATE - INTERVAL '1 day' * generate_series(0, 6),
    (RANDOM() * 10 + 8)::INT,
    CASE (RANDOM() * 5)::INT
        WHEN 0 THEN '팀 회의 참석'
        WHEN 1 THEN '포트폴리오 업데이트'
        WHEN 2 THEN '투자 리서치 공유'
        WHEN 3 THEN '투자 토론 참여'
        ELSE '동료 피드백 제공'
    END,
    NOW()
FROM public.user_profiles_2025_09_27_12_14 up
WHERE up.username NOT IN ('admin', 'testuser')
AND NOT EXISTS (
    SELECT 1 FROM public.participation_records_2025_09_27_12_14 pr 
    WHERE pr.user_id = up.id
);

-- 6. 포인트 시스템 초기화
INSERT INTO public.user_points_2025_09_28_06_00 (user_id, current_points, total_earned, total_spent, created_at, updated_at)
SELECT 
    up.id,
    (RANDOM() * 1000 + 500)::INT,
    (RANDOM() * 2000 + 1000)::INT,
    (RANDOM() * 500 + 100)::INT,
    NOW(),
    NOW()
FROM public.user_profiles_2025_09_27_12_14 up
WHERE up.username NOT IN ('admin', 'testuser')
AND NOT EXISTS (
    SELECT 1 FROM public.user_points_2025_09_28_06_00 pt 
    WHERE pt.user_id = up.id
);

-- 7. 팀별 포트폴리오 데이터 생성
INSERT INTO public.team_portfolios_2025_09_27_13_30 (team_id, stock_symbol, stock_name, quantity, average_price, current_price, total_value, profit_loss, profit_loss_percentage, last_updated, created_at)
SELECT 
    sg.id,
    stocks.symbol,
    stocks.name,
    (RANDOM() * 50 + 10)::INT,
    (RANDOM() * 200 + 100)::NUMERIC(10,2),
    (RANDOM() * 250 + 80)::NUMERIC(10,2),
    0, -- 계산될 예정
    0, -- 계산될 예정
    0, -- 계산될 예정
    NOW(),
    NOW()
FROM public.study_groups_2025_09_27_12_14 sg
CROSS JOIN (
    VALUES 
    ('AAPL', 'Apple Inc.'),
    ('TSLA', 'Tesla Inc.'),
    ('NVDA', 'NVIDIA Corp.'),
    ('MSFT', 'Microsoft Corp.'),
    ('GOOGL', 'Alphabet Inc.'),
    ('AMZN', 'Amazon.com Inc.')
) AS stocks(symbol, name)
WHERE sg.name LIKE '%팀'
AND NOT EXISTS (
    SELECT 1 FROM public.team_portfolios_2025_09_27_13_30 tp 
    WHERE tp.team_id = sg.id AND tp.stock_symbol = stocks.symbol
);

-- 8. 포트폴리오 수익률 계산 업데이트
UPDATE public.team_portfolios_2025_09_27_13_30 
SET 
    total_value = quantity * current_price,
    profit_loss = quantity * (current_price - average_price),
    profit_loss_percentage = ((current_price - average_price) / average_price) * 100
WHERE total_value = 0;

-- 9. 생성된 데이터 확인
SELECT 
    '생성된 사용자' as 구분,
    COUNT(*) as 개수
FROM public.user_profiles_2025_09_27_12_14 
WHERE username NOT IN ('admin', 'testuser')

UNION ALL

SELECT 
    '생성된 팀' as 구분,
    COUNT(*) as 개수
FROM public.study_groups_2025_09_27_12_14 
WHERE name LIKE '%팀'

UNION ALL

SELECT 
    '그룹 멤버십' as 구분,
    COUNT(*) as 개수
FROM public.group_memberships_2025_09_27_12_14 gm
JOIN public.study_groups_2025_09_27_12_14 sg ON gm.group_id = sg.id
WHERE sg.name LIKE '%팀'

UNION ALL

SELECT 
    '참여도 기록' as 구분,
    COUNT(*) as 개수
FROM public.participation_records_2025_09_27_12_14 pr
JOIN public.user_profiles_2025_09_27_12_14 up ON pr.user_id = up.id
WHERE up.username NOT IN ('admin', 'testuser')

UNION ALL

SELECT 
    '팀 포트폴리오' as 구분,
    COUNT(*) as 개수
FROM public.team_portfolios_2025_09_27_13_30 tp
JOIN public.study_groups_2025_09_27_12_14 sg ON tp.team_id = sg.id
WHERE sg.name LIKE '%팀';