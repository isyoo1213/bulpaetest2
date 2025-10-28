-- 가상 데이터 생성 (테스트용)

-- 1. 기존 테스트 데이터 정리
DELETE FROM public.group_memberships_2025_09_27_12_14 WHERE group_id IN (SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name LIKE '%테스트%');
DELETE FROM public.study_groups_2025_09_27_12_14 WHERE name LIKE '%테스트%';
DELETE FROM public.user_profiles_2025_09_27_12_14 WHERE username IN ('admin', 'testuser', 'member1', 'member2', 'member3', 'member4', 'member5', 'member6');

-- 2. 테스트 사용자 프로필 생성
INSERT INTO public.user_profiles_2025_09_27_12_14 (
    id, user_id, username, full_name, initial_capital, current_capital, created_at, updated_at
) VALUES 
-- 관리자
(2001, '11111111-1111-1111-1111-111111111111', 'admin', '시스템 관리자', 10000000, 12500000, NOW(), NOW()),
-- 일반 사용자
(2002, '22222222-2222-2222-2222-222222222222', 'testuser', '테스트 사용자', 10000000, 11200000, NOW(), NOW()),
-- 추가 팀원들
(2003, '33333333-3333-3333-3333-333333333333', 'member1', '김투자', 10000000, 13800000, NOW(), NOW()),
(2004, '44444444-4444-4444-4444-444444444444', 'member2', '이수익', 10000000, 9500000, NOW(), NOW()),
(2005, '55555555-5555-5555-5555-555555555555', 'member3', '박성장', 10000000, 14200000, NOW(), NOW()),
(2006, '66666666-6666-6666-6666-666666666666', 'member4', '최분석', 10000000, 8900000, NOW(), NOW()),
(2007, '77777777-7777-7777-7777-777777777777', 'member5', '정전략', 10000000, 15600000, NOW(), NOW()),
(2008, '88888888-8888-8888-8888-888888888888', 'member6', '한안정', 10000000, 10800000, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    full_name = EXCLUDED.full_name,
    current_capital = EXCLUDED.current_capital,
    updated_at = NOW();

-- 3. 테스트 스터디 그룹 생성
INSERT INTO public.study_groups_2025_09_27_12_14 (
    id, name, description, leader_id, created_at, updated_at
) VALUES 
(3001, '불패 A팀', '공격적 성장 투자 전략팀', 2001, NOW(), NOW()),
(3002, '불패 B팀', '안정적 가치 투자 전략팀', 2003, NOW(), NOW()),
(3003, '불패 C팀', '균형잡힌 포트폴리오 팀', 2005, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 4. 그룹 멤버십 생성
INSERT INTO public.group_memberships_2025_09_27_12_14 (
    group_id, user_id, joined_at
) VALUES 
-- A팀 (관리자, testuser, member1)
(3001, 2001, NOW()),
(3001, 2002, NOW()),
(3001, 2003, NOW()),
-- B팀 (member2, member3, member4)
(3002, 2004, NOW()),
(3002, 2005, NOW()),
(3002, 2006, NOW()),
-- C팀 (member5, member6)
(3003, 2007, NOW()),
(3003, 2008, NOW())
ON CONFLICT (group_id, user_id) DO NOTHING;

-- 5. 팀별 투자 기록 생성
INSERT INTO public.team_investment_records_2025_09_27_13_30 (
    team_id, stock_symbol, stock_name, transaction_type, quantity, price, total_amount, 
    transaction_date, notes, created_by, created_at
) VALUES 
-- A팀 투자 기록
(3001, 'AAPL', 'Apple Inc.', 'buy', 50, 150.00, 7500.00, '2024-01-15', 'AI 성장 기대', 2001, NOW()),
(3001, 'TSLA', 'Tesla Inc.', 'buy', 30, 200.00, 6000.00, '2024-01-20', '전기차 시장 확대', 2001, NOW()),
(3001, 'NVDA', 'NVIDIA Corp.', 'buy', 25, 400.00, 10000.00, '2024-02-01', 'AI 칩 수요 증가', 2001, NOW()),

-- B팀 투자 기록
(3002, 'KO', 'Coca-Cola Co.', 'buy', 100, 60.00, 6000.00, '2024-01-10', '안정적 배당주', 2004, NOW()),
(3002, 'JNJ', 'Johnson & Johnson', 'buy', 80, 150.00, 12000.00, '2024-01-25', '헬스케어 디펜시브', 2004, NOW()),
(3002, 'PG', 'Procter & Gamble', 'buy', 60, 140.00, 8400.00, '2024-02-05', '생필품 안정성', 2004, NOW()),

-- C팀 투자 기록
(3003, 'SPY', 'SPDR S&P 500 ETF', 'buy', 40, 400.00, 16000.00, '2024-01-12', 'S&P 500 분산투자', 2007, NOW()),
(3003, 'QQQ', 'Invesco QQQ ETF', 'buy', 30, 350.00, 10500.00, '2024-01-28', '나스닥 기술주 ETF', 2007, NOW()),
(3003, 'VTI', 'Vanguard Total Stock Market ETF', 'buy', 50, 220.00, 11000.00, '2024-02-10', '전체 시장 분산', 2007, NOW())
ON CONFLICT DO NOTHING;

-- 6. 참여도 데이터 생성
INSERT INTO public.participation_records_2025_09_27_12_14 (
    user_id, activity_type, activity_date, score, description, created_at
) VALUES 
-- 관리자 참여도
(2001, 'meeting_attendance', '2024-01-15', 10, '주간 투자 회의 참석', NOW()),
(2001, 'research_sharing', '2024-01-16', 15, 'NVIDIA 분석 보고서 공유', NOW()),
(2001, 'discussion_participation', '2024-01-17', 8, '투자 전략 토론 참여', NOW()),

-- 일반 사용자 참여도
(2002, 'meeting_attendance', '2024-01-15', 10, '주간 투자 회의 참석', NOW()),
(2002, 'portfolio_update', '2024-01-18', 12, '포트폴리오 업데이트', NOW()),
(2002, 'peer_feedback', '2024-01-19', 7, '동료 피드백 제공', NOW()),

-- 기타 멤버들 참여도
(2003, 'meeting_attendance', '2024-01-15', 10, '주간 투자 회의 참석', NOW()),
(2003, 'research_sharing', '2024-01-20', 18, 'Apple 실적 분석 공유', NOW()),
(2004, 'meeting_attendance', '2024-01-15', 10, '주간 투자 회의 참석', NOW()),
(2004, 'discussion_participation', '2024-01-21', 9, '리스크 관리 토론', NOW()),
(2005, 'meeting_attendance', '2024-01-15', 10, '주간 투자 회의 참석', NOW()),
(2005, 'portfolio_update', '2024-01-22', 14, '포트폴리오 리밸런싱', NOW())
ON CONFLICT DO NOTHING;

-- 7. 주간 평가 데이터 생성
INSERT INTO public.weekly_evaluations_2025_10_20_08_10 (
    week_start_date, week_end_date, status, created_at
) VALUES 
('2024-01-15', '2024-01-21', 'completed', NOW()),
('2024-01-22', '2024-01-28', 'completed', NOW()),
('2024-01-29', '2024-02-04', 'active', NOW())
ON CONFLICT DO NOTHING;

-- 8. 멤버별 주간 점수 생성
INSERT INTO public.member_weekly_scores_2025_10_20_08_10 (
    evaluation_id, user_id, activity_score, return_rate, final_score, created_at
) VALUES 
-- 1주차 점수
(1, 2001, 85, 12.5, 97.5, NOW()),
(1, 2002, 78, 8.2, 86.2, NOW()),
(1, 2003, 92, 15.8, 107.8, NOW()),
(1, 2004, 75, -2.1, 72.9, NOW()),
(1, 2005, 88, 18.3, 106.3, NOW()),

-- 2주차 점수
(2, 2001, 90, 14.2, 104.2, NOW()),
(2, 2002, 82, 10.5, 92.5, NOW()),
(2, 2003, 87, 12.1, 99.1, NOW()),
(2, 2004, 79, 3.8, 82.8, NOW()),
(2, 2005, 91, 16.7, 107.7, NOW())
ON CONFLICT DO NOTHING;

-- 9. 생성된 데이터 확인
SELECT 
    '생성된 사용자 프로필' as 구분,
    COUNT(*) as 개수
FROM public.user_profiles_2025_09_27_12_14 
WHERE username IN ('admin', 'testuser', 'member1', 'member2', 'member3', 'member4', 'member5', 'member6')

UNION ALL

SELECT 
    '생성된 스터디 그룹' as 구분,
    COUNT(*) as 개수
FROM public.study_groups_2025_09_27_12_14 
WHERE name LIKE '불패%팀'

UNION ALL

SELECT 
    '생성된 투자 기록' as 구분,
    COUNT(*) as 개수
FROM public.team_investment_records_2025_09_27_13_30

UNION ALL

SELECT 
    '생성된 참여도 기록' as 구분,
    COUNT(*) as 개수
FROM public.participation_records_2025_09_27_12_14

UNION ALL

SELECT 
    '생성된 주간 평가' as 구분,
    COUNT(*) as 개수
FROM public.weekly_evaluations_2025_10_20_08_10;