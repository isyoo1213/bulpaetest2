-- 팀원 역할 배정 (ORDER BY 수정)

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
        WHEN '프론티어팀' THEN 11475000
        WHEN '써밋팀' THEN 11360000
        WHEN '넥서스팀' THEN 11290000
        WHEN '옵티머스팀' THEN 11180000
        WHEN '모멘텀팀' THEN 11170000
        WHEN '아틀라스팀' THEN 9570000
        ELSE 10500000
    END,
    0,
    CASE sg.name
        WHEN '프론티어팀' THEN 14.75
        WHEN '써밋팀' THEN 13.6
        WHEN '넥서스팀' THEN 12.9
        WHEN '옵티머스팀' THEN 11.8
        WHEN '모멘텀팀' THEN 11.7
        WHEN '아틀라스팀' THEN -4.3
        ELSE 5.0
    END,
    CASE sg.name
        WHEN '프론티어팀' THEN 95
        WHEN '써밋팀' THEN 85
        WHEN '넥서스팀' THEN 80
        WHEN '옵티머스팀' THEN 75
        WHEN '모멘텀팀' THEN 70
        WHEN '아틀라스팀' THEN 30
        ELSE 60
    END,
    'completed'
FROM public.study_groups_2025_09_27_12_14 sg
WHERE sg.name LIKE '%팀'
ON CONFLICT (group_id, week_number, year) DO UPDATE SET
    end_asset = EXCLUDED.end_asset,
    team_return_rate = EXCLUDED.team_return_rate,
    team_return_score = EXCLUDED.team_return_score;

-- 3. 모든 팀원에게 역할 배정
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
    true, -- 참여
    true, -- 역할 완료
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN 20 -- 팀장
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN 18 -- 분석가
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN 16 -- 발표자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN 15 -- 기록자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN 14 -- 관찰자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 6 THEN 13 -- 서포터
    END, -- 참여 점수
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN 25 -- 팀장
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN 23 -- 분석가
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN 21 -- 발표자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN 19 -- 기록자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN 17 -- 관찰자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 6 THEN 15 -- 서포터
    END, -- 역할 점수
    (15 + (RANDOM() * 5)::INT), -- 활동 점수 15-20
    CASE sg.name
        WHEN '프론티어팀' THEN (18 + (RANDOM() * 5)::INT)
        WHEN '써밋팀' THEN (16 + (RANDOM() * 5)::INT)
        WHEN '넥서스팀' THEN (15 + (RANDOM() * 5)::INT)
        WHEN '옵티머스팀' THEN (14 + (RANDOM() * 5)::INT)
        WHEN '모멘텀팀' THEN (13 + (RANDOM() * 5)::INT)
        WHEN '아틀라스팀' THEN (8 + (RANDOM() * 5)::INT)
        ELSE (12 + (RANDOM() * 5)::INT)
    END, -- 수익률 점수
    0, -- final_score는 나중에 계산
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN '팀장 역할을 훌륭히 수행했습니다'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN '시장 분석이 정확했습니다'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN '발표 준비를 잘 했습니다'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN '기록을 성실히 작성했습니다'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN '객관적 관찰을 잘 했습니다'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 6 THEN '팀원 지원을 잘 했습니다'
    END
FROM public.weekly_evaluations_2025_10_20_08_10 we
JOIN public.study_groups_2025_09_27_12_14 sg ON we.group_id = sg.id
JOIN public.group_memberships_2025_09_27_12_14 gm ON sg.id = gm.group_id
JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
WHERE sg.name LIKE '%팀' AND we.week_number = 1 AND up.username NOT IN ('admin', 'testuser')
ON CONFLICT (evaluation_id, member_id) DO UPDATE SET
    assigned_role = EXCLUDED.assigned_role,
    participated = EXCLUDED.participated,
    role_completed = EXCLUDED.role_completed;

-- 4. final_score 계산
UPDATE public.member_weekly_scores_2025_10_20_08_10 
SET final_score = participation_score + role_score + activity_score + return_score
WHERE final_score = 0;

-- 5. 생성 결과 확인
SELECT 
    '🎉 팀원 역할 배정 완료!' as 메시지,
    COUNT(*)::text || '명 역할 배정' as 상세
FROM public.member_weekly_scores_2025_10_20_08_10

UNION ALL

SELECT 
    '✅ 역할별 배정 현황' as 메시지,
    assigned_role || ': ' || COUNT(*)::text || '명' as 상세
FROM public.member_weekly_scores_2025_10_20_08_10
GROUP BY assigned_role;