-- 팀원 역할 배정 (간단한 방식)

-- 1. 역할 정의 테이블에 기본 역할들 삽입
INSERT INTO public.role_definitions_2025_10_20_08_10 (role_name, role_key, description, responsibilities, is_rotating, sort_order) VALUES
('팀장', 'team_leader', '팀을 이끌고 전체적인 방향을 제시하는 역할', '팀 회의 주도, 의사결정, 팀원 관리, 전략 수립', true, 1),
('분석가', 'analyst', '시장 분석과 투자 종목 리서치를 담당하는 역할', '시장 분석, 종목 리서치, 투자 보고서 작성, 데이터 분석', true, 2),
('발표자', 'presenter', '팀의 성과와 전략을 발표하는 역할', '주간 발표, 성과 보고, 프레젠테이션 준비, 대외 소통', true, 3),
('기록자', 'recorder', '팀의 모든 활동과 결과를 기록하는 역할', '회의록 작성, 투자 기록 관리, 문서 정리, 데이터 입력', true, 4),
('관찰자', 'observer', '팀 활동을 객관적으로 관찰하고 피드백하는 역할', '팀 활동 관찰, 객관적 피드백, 개선사항 제안, 분위기 조성', true, 5),
('서포터', 'supporter', '팀원들을 지원하고 보조하는 역할', '팀원 지원, 업무 보조, 분위기 메이커, 동기부여', true, 6)
ON CONFLICT (role_key) DO UPDATE SET
    role_name = EXCLUDED.role_name,
    description = EXCLUDED.description,
    responsibilities = EXCLUDED.responsibilities;

-- 2. 각 팀별로 1주차 주간 평가 생성
INSERT INTO public.weekly_evaluations_2025_10_20_08_10 (
    group_id, week_number, year, start_asset, end_asset, net_flow, 
    team_return_rate, team_return_score, status
)
SELECT 
    sg.id,
    1, -- 1주차
    2025,
    10000000, -- 시작 자산
    CASE sg.name
        WHEN '프론티어팀' THEN 11475000  -- 14.75% 수익
        WHEN '써밋팀' THEN 11360000      -- 13.6% 수익
        WHEN '넥서스팀' THEN 11290000    -- 12.9% 수익
        WHEN '옵티머스팀' THEN 11180000  -- 11.8% 수익
        WHEN '모멘텀팀' THEN 11170000    -- 11.7% 수익
        WHEN '아틀라스팀' THEN 9570000   -- -4.3% 손실
        ELSE 10500000
    END, -- 종료 자산
    0, -- 순 유입
    CASE sg.name
        WHEN '프론티어팀' THEN 14.75
        WHEN '써밋팀' THEN 13.6
        WHEN '넥서스팀' THEN 12.9
        WHEN '옵티머스팀' THEN 11.8
        WHEN '모멘텀팀' THEN 11.7
        WHEN '아틀라스팀' THEN -4.3
        ELSE 5.0
    END, -- 팀 수익률
    CASE sg.name
        WHEN '프론티어팀' THEN 95
        WHEN '써밋팀' THEN 85
        WHEN '넥서스팀' THEN 80
        WHEN '옵티머스팀' THEN 75
        WHEN '모멘텀팀' THEN 70
        WHEN '아틀라스팀' THEN 30
        ELSE 60
    END, -- 팀 수익률 점수
    'completed' -- status
FROM public.study_groups_2025_09_27_12_14 sg
WHERE sg.name LIKE '%팀'
ON CONFLICT (group_id, week_number, year) DO UPDATE SET
    end_asset = EXCLUDED.end_asset,
    team_return_rate = EXCLUDED.team_return_rate,
    team_return_score = EXCLUDED.team_return_score;

-- 3. 옵티머스팀 멤버별 역할 배정
INSERT INTO public.member_weekly_scores_2025_10_20_08_10 (
    evaluation_id, member_id, assigned_role, participated, role_completed,
    participation_score, role_score, activity_score, return_score, final_score, comment
)
SELECT 
    we.id,
    up.id,
    CASE up.username
        WHEN 'kim_optimal' THEN 'team_leader'
        WHEN 'lee_efficient' THEN 'analyst'
        WHEN 'park_stable' THEN 'presenter'
        WHEN 'choi_profit' THEN 'recorder'
        WHEN 'jung_balance' THEN 'observer'
        WHEN 'han_careful' THEN 'supporter'
    END,
    true, true, 20, 25, 18, 16, 79,
    CASE up.username
        WHEN 'kim_optimal' THEN '팀장 역할을 훌륭히 수행했습니다'
        WHEN 'lee_efficient' THEN '시장 분석이 정확했습니다'
        WHEN 'park_stable' THEN '발표 준비를 잘 했습니다'
        WHEN 'choi_profit' THEN '기록을 성실히 작성했습니다'
        WHEN 'jung_balance' THEN '객관적 관찰을 잘 했습니다'
        WHEN 'han_careful' THEN '팀원 지원을 잘 했습니다'
    END
FROM public.weekly_evaluations_2025_10_20_08_10 we
JOIN public.study_groups_2025_09_27_12_14 sg ON we.group_id = sg.id
JOIN public.group_memberships_2025_09_27_12_14 gm ON sg.id = gm.group_id
JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
WHERE sg.name = '옵티머스팀' AND we.week_number = 1
ON CONFLICT (evaluation_id, member_id) DO UPDATE SET
    assigned_role = EXCLUDED.assigned_role,
    participated = EXCLUDED.participated,
    role_completed = EXCLUDED.role_completed;

-- 4. 써밋팀 멤버별 역할 배정
INSERT INTO public.member_weekly_scores_2025_10_20_08_10 (
    evaluation_id, member_id, assigned_role, participated, role_completed,
    participation_score, role_score, activity_score, return_score, final_score, comment
)
SELECT 
    we.id,
    up.id,
    CASE up.username
        WHEN 'lee_summit' THEN 'team_leader'
        WHEN 'park_challenge' THEN 'analyst'
        WHEN 'kim_achieve' THEN 'presenter'
        WHEN 'choi_goal' THEN 'recorder'
        WHEN 'jung_passion' THEN 'observer'
        WHEN 'han_victory' THEN 'supporter'
    END,
    true, true, 20, 25, 19, 18, 82,
    CASE up.username
        WHEN 'lee_summit' THEN '팀장 역할을 훌륭히 수행했습니다'
        WHEN 'park_challenge' THEN '시장 분석이 정확했습니다'
        WHEN 'kim_achieve' THEN '발표 준비를 잘 했습니다'
        WHEN 'choi_goal' THEN '기록을 성실히 작성했습니다'
        WHEN 'jung_passion' THEN '객관적 관찰을 잘 했습니다'
        WHEN 'han_victory' THEN '팀원 지원을 잘 했습니다'
    END
FROM public.weekly_evaluations_2025_10_20_08_10 we
JOIN public.study_groups_2025_09_27_12_14 sg ON we.group_id = sg.id
JOIN public.group_memberships_2025_09_27_12_14 gm ON sg.id = gm.group_id
JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
WHERE sg.name = '써밋팀' AND we.week_number = 1
ON CONFLICT (evaluation_id, member_id) DO UPDATE SET
    assigned_role = EXCLUDED.assigned_role;

-- 5. 프론티어팀 멤버별 역할 배정
INSERT INTO public.member_weekly_scores_2025_10_20_08_10 (
    evaluation_id, member_id, assigned_role, participated, role_completed,
    participation_score, role_score, activity_score, return_score, final_score, comment
)
SELECT 
    we.id,
    up.id,
    CASE up.username
        WHEN 'park_pioneer' THEN 'team_leader'
        WHEN 'kim_innovation' THEN 'analyst'
        WHEN 'lee_explore' THEN 'presenter'
        WHEN 'choi_future' THEN 'recorder'
        WHEN 'jung_create' THEN 'observer'
        WHEN 'han_advance' THEN 'supporter'
    END,
    true, true, 20, 25, 20, 20, 85,
    CASE up.username
        WHEN 'park_pioneer' THEN '팀장 역할을 훌륭히 수행했습니다'
        WHEN 'kim_innovation' THEN '시장 분석이 정확했습니다'
        WHEN 'lee_explore' THEN '발표 준비를 잘 했습니다'
        WHEN 'choi_future' THEN '기록을 성실히 작성했습니다'
        WHEN 'jung_create' THEN '객관적 관찰을 잘 했습니다'
        WHEN 'han_advance' THEN '팀원 지원을 잘 했습니다'
    END
FROM public.weekly_evaluations_2025_10_20_08_10 we
JOIN public.study_groups_2025_09_27_12_14 sg ON we.group_id = sg.id
JOIN public.group_memberships_2025_09_27_12_14 gm ON sg.id = gm.group_id
JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
WHERE sg.name = '프론티어팀' AND we.week_number = 1
ON CONFLICT (evaluation_id, member_id) DO UPDATE SET
    assigned_role = EXCLUDED.assigned_role;

-- 6. 나머지 팀들도 동일하게 배정
INSERT INTO public.member_weekly_scores_2025_10_20_08_10 (
    evaluation_id, member_id, assigned_role, participated, role_completed,
    participation_score, role_score, activity_score, return_score, final_score, comment
)
SELECT 
    we.id,
    up.id,
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN 'team_leader'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN 'analyst'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN 'presenter'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN 'recorder'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN 'observer'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 6 THEN 'supporter'
    END,
    true, true, 18, 22, 17, 15, 72, '역할을 성실히 수행했습니다'
FROM public.weekly_evaluations_2025_10_20_08_10 we
JOIN public.study_groups_2025_09_27_12_14 sg ON we.group_id = sg.id
JOIN public.group_memberships_2025_09_27_12_14 gm ON sg.id = gm.group_id
JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
WHERE sg.name IN ('모멘텀팀', '아틀라스팀', '넥서스팀') AND we.week_number = 1
ON CONFLICT (evaluation_id, member_id) DO UPDATE SET
    assigned_role = EXCLUDED.assigned_role;

-- 7. 생성 결과 확인
SELECT 
    '🎉 팀원 역할 배정 완료!' as 메시지,
    COUNT(*)::text || '명 역할 배정' as 상세
FROM public.member_weekly_scores_2025_10_20_08_10

UNION ALL

SELECT 
    '✅ 팀별 역할 현황' as 메시지,
    sg.name || ': ' || COUNT(mws.id)::text || '명 배정' as 상세
FROM public.member_weekly_scores_2025_10_20_08_10 mws
JOIN public.weekly_evaluations_2025_10_20_08_10 we ON mws.evaluation_id = we.id
JOIN public.study_groups_2025_09_27_12_14 sg ON we.group_id = sg.id
GROUP BY sg.id, sg.name
ORDER BY sg.name;