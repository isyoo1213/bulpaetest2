-- 간단한 평가시스템 데이터 생성 (null 오류 수정)

-- 1. 기존 평가 데이터 정리
DELETE FROM public.member_weekly_scores_2025_10_20_08_10;
DELETE FROM public.weekly_evaluations_2025_10_20_08_10;

-- 2. 1주차 주간 평가 생성
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
WHERE sg.name LIKE '%팀';

-- 3. 프론티어팀 멤버별 역할 배정 (1주차)
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
    true, true, 20, 25, 18, 20, 83,
    CASE up.username
        WHEN 'park_pioneer' THEN '1주차 팀장 역할을 훌륭히 수행했습니다'
        WHEN 'kim_innovation' THEN '1주차 시장 분석이 정확했습니다'
        WHEN 'lee_explore' THEN '1주차 발표 준비를 잘 했습니다'
        WHEN 'choi_future' THEN '1주차 기록을 성실히 작성했습니다'
        WHEN 'jung_create' THEN '1주차 객관적 관찰을 잘 했습니다'
        WHEN 'han_advance' THEN '1주차 팀원 지원을 잘 했습니다'
    END
FROM public.weekly_evaluations_2025_10_20_08_10 we
JOIN public.study_groups_2025_09_27_12_14 sg ON we.group_id = sg.id
JOIN public.group_memberships_2025_09_27_12_14 gm ON sg.id = gm.group_id
JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
WHERE sg.name = '프론티어팀' AND we.week_number = 1;

-- 4. 써밋팀 멤버별 역할 배정 (1주차)
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
    true, true, 20, 25, 17, 18, 80,
    CASE up.username
        WHEN 'lee_summit' THEN '1주차 팀장 역할을 훌륭히 수행했습니다'
        WHEN 'park_challenge' THEN '1주차 시장 분석이 정확했습니다'
        WHEN 'kim_achieve' THEN '1주차 발표 준비를 잘 했습니다'
        WHEN 'choi_goal' THEN '1주차 기록을 성실히 작성했습니다'
        WHEN 'jung_passion' THEN '1주차 객관적 관찰을 잘 했습니다'
        WHEN 'han_victory' THEN '1주차 팀원 지원을 잘 했습니다'
    END
FROM public.weekly_evaluations_2025_10_20_08_10 we
JOIN public.study_groups_2025_09_27_12_14 sg ON we.group_id = sg.id
JOIN public.group_memberships_2025_09_27_12_14 gm ON sg.id = gm.group_id
JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
WHERE sg.name = '써밋팀' AND we.week_number = 1;

-- 5. 나머지 팀들 역할 배정 (1주차)
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
        ELSE 'supporter'
    END,
    true, true, 18, 22, 16, 15, 71,
    '1주차 역할을 성실히 수행했습니다'
FROM public.weekly_evaluations_2025_10_20_08_10 we
JOIN public.study_groups_2025_09_27_12_14 sg ON we.group_id = sg.id
JOIN public.group_memberships_2025_09_27_12_14 gm ON sg.id = gm.group_id
JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
WHERE sg.name IN ('넥서스팀', '옵티머스팀', '모멘텀팀', '아틀라스팀') AND we.week_number = 1;

-- 6. 2주차 주간 평가 생성
INSERT INTO public.weekly_evaluations_2025_10_20_08_10 (
    group_id, week_number, year, start_asset, end_asset, net_flow, 
    team_return_rate, team_return_score, status
)
SELECT 
    sg.id,
    2, -- 2주차
    2025,
    CASE sg.name
        WHEN '프론티어팀' THEN 11475000
        WHEN '써밋팀' THEN 11360000
        WHEN '넥서스팀' THEN 11290000
        WHEN '옵티머스팀' THEN 11180000
        WHEN '모멘텀팀' THEN 11170000
        WHEN '아틀라스팀' THEN 9570000
        ELSE 10500000
    END, -- 시작 자산
    CASE sg.name
        WHEN '프론티어팀' THEN 11950000  -- 추가 상승
        WHEN '써밋팀' THEN 11720000
        WHEN '넥서스팀' THEN 11580000
        WHEN '옵티머스팀' THEN 11360000
        WHEN '모멘텀팀' THEN 11340000
        WHEN '아틀라스팀' THEN 9140000   -- 추가 하락
        ELSE 10600000
    END, -- 종료 자산
    0,
    CASE sg.name
        WHEN '프론티어팀' THEN 19.5
        WHEN '써밋팀' THEN 17.2
        WHEN '넥서스팀' THEN 15.8
        WHEN '옵티머스팀' THEN 13.6
        WHEN '모멘텀팀' THEN 13.4
        WHEN '아틀라스팀' THEN -8.6
        ELSE 6.0
    END,
    CASE sg.name
        WHEN '프론티어팀' THEN 93
        WHEN '써밋팀' THEN 83
        WHEN '넥서스팀' THEN 78
        WHEN '옵티머스팀' THEN 73
        WHEN '모멘텀팀' THEN 68
        WHEN '아틀라스팀' THEN 28
        ELSE 58
    END,
    'completed'
FROM public.study_groups_2025_09_27_12_14 sg
WHERE sg.name LIKE '%팀';

-- 7. 2주차 멤버 점수 (동일 역할 유지)
INSERT INTO public.member_weekly_scores_2025_10_20_08_10 (
    evaluation_id, member_id, assigned_role, participated, role_completed,
    participation_score, role_score, activity_score, return_score, final_score, comment
)
SELECT 
    we2.id,
    mws1.member_id,
    mws1.assigned_role, -- 동일 역할 유지
    CASE WHEN RANDOM() > 0.1 THEN true ELSE false END, -- 90% 참여율
    CASE WHEN RANDOM() > 0.2 THEN true ELSE false END, -- 80% 역할완료율
    mws1.participation_score,
    mws1.role_score,
    (15 + (RANDOM() * 5)::INT), -- 활동 점수 변동
    mws1.return_score + (RANDOM() * 3)::INT, -- 수익률 점수 약간 변동
    0, -- final_score는 나중에 계산
    '2주차 ' || REPLACE(mws1.comment, '1주차 ', '')
FROM public.member_weekly_scores_2025_10_20_08_10 mws1
JOIN public.weekly_evaluations_2025_10_20_08_10 we1 ON mws1.evaluation_id = we1.id
JOIN public.weekly_evaluations_2025_10_20_08_10 we2 ON we1.group_id = we2.group_id
WHERE we1.week_number = 1 AND we2.week_number = 2;

-- 8. final_score 계산
UPDATE public.member_weekly_scores_2025_10_20_08_10 
SET final_score = participation_score + role_score + activity_score + return_score
WHERE final_score = 0;

-- 9. 생성 결과 확인
SELECT 
    '🎉 평가시스템 데이터 생성 완료!' as 메시지,
    COUNT(*)::text || '개 평가 기록 생성 (1-2주차)' as 상세
FROM public.member_weekly_scores_2025_10_20_08_10;