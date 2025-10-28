-- 팀원 역할 배정 및 2주 순환 시스템 구축

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

-- 2. 현재 주차 계산 (2025년 1월 1일부터 계산)
WITH current_week AS (
    SELECT EXTRACT(WEEK FROM CURRENT_DATE) - EXTRACT(WEEK FROM DATE '2025-01-01') + 1 AS week_num
),
team_members AS (
    SELECT 
        up.id as member_id,
        up.full_name,
        up.username,
        sg.id as group_id,
        sg.name as group_name,
        ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) as member_order
    FROM public.user_profiles_2025_09_27_12_14 up
    JOIN public.group_memberships_2025_09_27_12_14 gm ON up.id = gm.user_id
    JOIN public.study_groups_2025_09_27_12_14 sg ON gm.group_id = sg.id
    WHERE up.username NOT IN ('admin', 'testuser')
),
role_assignments AS (
    SELECT 
        tm.*,
        rd.role_key,
        rd.role_name,
        cw.week_num,
        -- 2주 순환: (주차-1) / 2 * 6 + 멤버순서로 역할 배정
        rd.role_key as assigned_role,
        CASE 
            WHEN (cw.week_num - 1) % 2 = 0 THEN cw.week_num  -- 짝수 주차 시작
            ELSE cw.week_num - 1  -- 홀수 주차는 이전 주차와 같은 역할
        END as role_start_week
    FROM team_members tm
    CROSS JOIN current_week cw
    JOIN (
        SELECT 
            role_key, 
            role_name,
            ROW_NUMBER() OVER (ORDER BY sort_order) as role_order
        FROM public.role_definitions_2025_10_20_08_10 
        WHERE is_rotating = true
    ) rd ON rd.role_order = ((tm.member_order - 1 + FLOOR((cw.week_num - 1) / 2)) % 6) + 1
)

-- 3. 주간 평가 데이터 생성 (각 팀별로)
INSERT INTO public.weekly_evaluations_2025_10_20_08_10 (
    group_id, week_number, year, start_asset, end_asset, net_flow, 
    team_return_rate, team_return_score, status, created_at, updated_at
)
SELECT DISTINCT
    ra.group_id,
    ra.week_num,
    2025,
    10000000, -- 시작 자산
    CASE ra.group_name
        WHEN '프론티어팀' THEN 11475000  -- 14.75% 수익
        WHEN '써밋팀' THEN 11360000      -- 13.6% 수익
        WHEN '넥서스팀' THEN 11290000    -- 12.9% 수익
        WHEN '옵티머스팀' THEN 11180000  -- 11.8% 수익
        WHEN '모멘텀팀' THEN 11170000    -- 11.7% 수익
        WHEN '아틀라스팀' THEN 9570000   -- -4.3% 손실
        ELSE 10500000
    END, -- 종료 자산
    0, -- 순 유입
    CASE ra.group_name
        WHEN '프론티어팀' THEN 14.75
        WHEN '써밋팀' THEN 13.6
        WHEN '넥서스팀' THEN 12.9
        WHEN '옵티머스팀' THEN 11.8
        WHEN '모멘텀팀' THEN 11.7
        WHEN '아틀라스팀' THEN -4.3
        ELSE 5.0
    END, -- 팀 수익률
    CASE ra.group_name
        WHEN '프론티어팀' THEN 95
        WHEN '써밋팀' THEN 85
        WHEN '넥서스팀' THEN 80
        WHEN '옵티머스팀' THEN 75
        WHEN '모멘텀팀' THEN 70
        WHEN '아틀라스팀' THEN 30
        ELSE 60
    END, -- 팀 수익률 점수
    'active',
    NOW(),
    NOW()
FROM role_assignments ra
ON CONFLICT (group_id, week_number, year) DO UPDATE SET
    end_asset = EXCLUDED.end_asset,
    team_return_rate = EXCLUDED.team_return_rate,
    team_return_score = EXCLUDED.team_return_score,
    updated_at = NOW();

-- 4. 팀원별 주간 점수 생성
INSERT INTO public.member_weekly_scores_2025_10_20_08_10 (
    evaluation_id, member_id, assigned_role, participated, role_completed,
    participation_score, role_score, activity_score, return_score, final_score,
    comment, created_at, updated_at
)
SELECT 
    we.id as evaluation_id,
    ra.member_id,
    ra.role_key as assigned_role,
    true as participated, -- 기본적으로 참여로 설정
    CASE 
        WHEN RANDOM() > 0.2 THEN true  -- 80% 확률로 역할 완료
        ELSE false
    END as role_completed,
    CASE 
        WHEN ra.role_key = 'team_leader' THEN 20
        WHEN ra.role_key = 'analyst' THEN 18
        WHEN ra.role_key = 'presenter' THEN 16
        WHEN ra.role_key = 'recorder' THEN 15
        WHEN ra.role_key = 'observer' THEN 14
        WHEN ra.role_key = 'supporter' THEN 13
        ELSE 15
    END as participation_score,
    CASE 
        WHEN ra.role_key = 'team_leader' THEN 25
        WHEN ra.role_key = 'analyst' THEN 23
        WHEN ra.role_key = 'presenter' THEN 21
        WHEN ra.role_key = 'recorder' THEN 19
        WHEN ra.role_key = 'observer' THEN 17
        WHEN ra.role_key = 'supporter' THEN 15
        ELSE 20
    END as role_score,
    (RANDOM() * 10 + 10)::INT as activity_score, -- 10-20점 랜덤
    CASE ra.group_name
        WHEN '프론티어팀' THEN (RANDOM() * 5 + 18)::INT  -- 18-23점
        WHEN '써밋팀' THEN (RANDOM() * 5 + 16)::INT      -- 16-21점
        WHEN '넥서스팀' THEN (RANDOM() * 5 + 15)::INT    -- 15-20점
        WHEN '옵티머스팀' THEN (RANDOM() * 5 + 14)::INT  -- 14-19점
        WHEN '모멘텀팀' THEN (RANDOM() * 5 + 13)::INT    -- 13-18점
        WHEN '아틀라스팀' THEN (RANDOM() * 5 + 8)::INT   -- 8-13점
        ELSE (RANDOM() * 5 + 12)::INT
    END as return_score,
    0 as final_score, -- 트리거에서 자동 계산
    CASE ra.role_key
        WHEN 'team_leader' THEN '팀을 잘 이끌고 있습니다'
        WHEN 'analyst' THEN '분석 능력이 뛰어납니다'
        WHEN 'presenter' THEN '발표 실력이 좋습니다'
        WHEN 'recorder' THEN '기록을 성실히 작성합니다'
        WHEN 'observer' THEN '객관적 관찰력이 우수합니다'
        WHEN 'supporter' THEN '팀원 지원을 잘 합니다'
        ELSE '열심히 참여하고 있습니다'
    END as comment,
    NOW(),
    NOW()
FROM role_assignments ra
JOIN public.weekly_evaluations_2025_10_20_08_10 we ON ra.group_id = we.group_id AND ra.week_num = we.week_number
ON CONFLICT (evaluation_id, member_id) DO UPDATE SET
    assigned_role = EXCLUDED.assigned_role,
    participation_score = EXCLUDED.participation_score,
    role_score = EXCLUDED.role_score,
    updated_at = NOW();

-- 5. 역할별 의견 생성
INSERT INTO public.role_opinions_2025_10_20_08_10 (
    evaluation_id, role_key, opinion_text, created_at, updated_at
)
SELECT DISTINCT
    we.id as evaluation_id,
    rd.role_key,
    CASE rd.role_key
        WHEN 'team_leader' THEN '이번 주 팀장은 팀을 잘 이끌어 주었고, 의사결정 과정에서 팀원들의 의견을 적극 수렴했습니다.'
        WHEN 'analyst' THEN '시장 분석이 정확했고, 투자 종목 선정에 도움이 되는 유용한 정보를 제공해주었습니다.'
        WHEN 'presenter' THEN '발표 준비를 철저히 했고, 팀의 성과를 명확하게 전달해주었습니다.'
        WHEN 'recorder' THEN '회의록과 투자 기록을 정확하게 작성해주어 팀 활동 추적에 도움이 되었습니다.'
        WHEN 'observer' THEN '팀 활동을 객관적으로 관찰하고 건설적인 피드백을 제공해주었습니다.'
        WHEN 'supporter' THEN '팀원들을 적극 지원하고 팀 분위기를 좋게 만들어주었습니다.'
        ELSE '역할을 성실히 수행해주었습니다.'
    END as opinion_text,
    NOW(),
    NOW()
FROM public.weekly_evaluations_2025_10_20_08_10 we
CROSS JOIN public.role_definitions_2025_10_20_08_10 rd
WHERE rd.is_rotating = true
ON CONFLICT (evaluation_id, role_key) DO UPDATE SET
    opinion_text = EXCLUDED.opinion_text,
    updated_at = NOW();

-- 6. 생성 결과 확인
SELECT 
    '🎉 팀원 역할 배정 완료!' as 메시지,
    '6개 팀 × 6명 = 36명 역할 배정' as 상세

UNION ALL

SELECT 
    '✅ 생성된 주간 평가: ' || COUNT(*)::text as 메시지,
    '각 팀별 현재 주차 평가 데이터' as 상세
FROM public.weekly_evaluations_2025_10_20_08_10

UNION ALL

SELECT 
    '✅ 생성된 멤버 점수: ' || COUNT(*)::text as 메시지,
    '역할별 차별화된 점수 배정' as 상세
FROM public.member_weekly_scores_2025_10_20_08_10

UNION ALL

SELECT 
    '✅ 생성된 역할 의견: ' || COUNT(*)::text as 메시지,
    '6가지 역할별 의견 작성' as 상세
FROM public.role_opinions_2025_10_20_08_10;