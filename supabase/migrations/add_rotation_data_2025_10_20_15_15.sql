-- 3-4주차 역할 순환 데이터 추가 생성

-- 1. 3주차 주간 평가 생성
INSERT INTO public.weekly_evaluations_2025_10_20_08_10 (
    group_id, week_number, year, start_asset, end_asset, net_flow, 
    team_return_rate, team_return_score, status
)
SELECT 
    sg.id,
    3, -- 3주차
    2025,
    CASE sg.name
        WHEN '프론티어팀' THEN 11950000
        WHEN '써밋팀' THEN 11720000
        WHEN '넥서스팀' THEN 11580000
        WHEN '옵티머스팀' THEN 11360000
        WHEN '모멘텀팀' THEN 11340000
        WHEN '아틀라스팀' THEN 9140000
        ELSE 10600000
    END, -- 시작 자산
    CASE sg.name
        WHEN '프론티어팀' THEN 12425000  -- 계속 상승
        WHEN '써밋팀' THEN 12080000
        WHEN '넥서스팀' THEN 11870000
        WHEN '옵티머스팀' THEN 11540000
        WHEN '모멘텀팀' THEN 11510000
        WHEN '아틀라스팀' THEN 8710000   -- 계속 하락
        ELSE 10700000
    END, -- 종료 자산
    0,
    CASE sg.name
        WHEN '프론티어팀' THEN 24.25
        WHEN '써밋팀' THEN 20.8
        WHEN '넥서스팀' THEN 18.7
        WHEN '옵티머스팀' THEN 15.4
        WHEN '모멘텀팀' THEN 15.1
        WHEN '아틀라스팀' THEN -12.9
        ELSE 7.0
    END,
    CASE sg.name
        WHEN '프론티어팀' THEN 91
        WHEN '써밋팀' THEN 81
        WHEN '넥서스팀' THEN 76
        WHEN '옵티머스팀' THEN 71
        WHEN '모멘텀팀' THEN 66
        WHEN '아틀라스팀' THEN 26
        ELSE 56
    END,
    'completed'
FROM public.study_groups_2025_09_27_12_14 sg
WHERE sg.name LIKE '%팀';

-- 2. 4주차 주간 평가 생성
INSERT INTO public.weekly_evaluations_2025_10_20_08_10 (
    group_id, week_number, year, start_asset, end_asset, net_flow, 
    team_return_rate, team_return_score, status
)
SELECT 
    sg.id,
    4, -- 4주차
    2025,
    CASE sg.name
        WHEN '프론티어팀' THEN 12425000
        WHEN '써밋팀' THEN 12080000
        WHEN '넥서스팀' THEN 11870000
        WHEN '옵티머스팀' THEN 11540000
        WHEN '모멘텀팀' THEN 11510000
        WHEN '아틀라스팀' THEN 8710000
        ELSE 10700000
    END, -- 시작 자산
    CASE sg.name
        WHEN '프론티어팀' THEN 12900000  -- 최종 상승
        WHEN '써밋팀' THEN 12440000
        WHEN '넥서스팀' THEN 12160000
        WHEN '옵티머스팀' THEN 11720000
        WHEN '모멘텀팀' THEN 11680000
        WHEN '아틀라스팀' THEN 8280000   -- 최종 하락
        ELSE 10800000
    END, -- 종료 자산
    0,
    CASE sg.name
        WHEN '프론티어팀' THEN 29.0
        WHEN '써밋팀' THEN 24.4
        WHEN '넥서스팀' THEN 21.6
        WHEN '옵티머스팀' THEN 17.2
        WHEN '모멘텀팀' THEN 16.8
        WHEN '아틀라스팀' THEN -17.2
        ELSE 8.0
    END,
    CASE sg.name
        WHEN '프론티어팀' THEN 89
        WHEN '써밋팀' THEN 79
        WHEN '넥서스팀' THEN 74
        WHEN '옵티머스팀' THEN 69
        WHEN '모멘텀팀' THEN 64
        WHEN '아틀라스팀' THEN 24
        ELSE 54
    END,
    'completed'
FROM public.study_groups_2025_09_27_12_14 sg
WHERE sg.name LIKE '%팀';

-- 3. 3주차 역할 순환 (팀장→분석가→발표자→기록자→관찰자→서포터→팀장)
INSERT INTO public.member_weekly_scores_2025_10_20_08_10 (
    evaluation_id, member_id, assigned_role, participated, role_completed,
    participation_score, role_score, activity_score, return_score, final_score, comment
)
SELECT 
    we3.id,
    mws1.member_id,
    CASE mws1.assigned_role
        WHEN 'team_leader' THEN 'analyst'    -- 팀장 → 분석가
        WHEN 'analyst' THEN 'presenter'      -- 분석가 → 발표자
        WHEN 'presenter' THEN 'recorder'     -- 발표자 → 기록자
        WHEN 'recorder' THEN 'observer'      -- 기록자 → 관찰자
        WHEN 'observer' THEN 'supporter'     -- 관찰자 → 서포터
        WHEN 'supporter' THEN 'team_leader'  -- 서포터 → 팀장
    END, -- 역할 순환
    CASE WHEN RANDOM() > 0.15 THEN true ELSE false END, -- 85% 참여율
    CASE WHEN RANDOM() > 0.25 THEN true ELSE false END, -- 75% 역할완료율
    CASE mws1.assigned_role
        WHEN 'team_leader' THEN 18  -- 분석가 점수
        WHEN 'analyst' THEN 16      -- 발표자 점수
        WHEN 'presenter' THEN 15    -- 기록자 점수
        WHEN 'recorder' THEN 14     -- 관찰자 점수
        WHEN 'observer' THEN 13     -- 서포터 점수
        WHEN 'supporter' THEN 20    -- 팀장 점수
    END,
    CASE mws1.assigned_role
        WHEN 'team_leader' THEN 23  -- 분석가 점수
        WHEN 'analyst' THEN 21      -- 발표자 점수
        WHEN 'presenter' THEN 19    -- 기록자 점수
        WHEN 'recorder' THEN 17     -- 관찰자 점수
        WHEN 'observer' THEN 15     -- 서포터 점수
        WHEN 'supporter' THEN 25    -- 팀장 점수
    END,
    (15 + (RANDOM() * 5)::INT), -- 활동 점수
    mws1.return_score + (RANDOM() * 2)::INT, -- 수익률 점수 약간 변동
    0, -- final_score는 나중에 계산
    CASE mws1.assigned_role
        WHEN 'team_leader' THEN '3주차 분석가로 역할 변경 - 시장 분석 우수'
        WHEN 'analyst' THEN '3주차 발표자로 역할 변경 - 발표 실력 향상'
        WHEN 'presenter' THEN '3주차 기록자로 역할 변경 - 기록 관리 체계적'
        WHEN 'recorder' THEN '3주차 관찰자로 역할 변경 - 객관적 시각 제공'
        WHEN 'observer' THEN '3주차 서포터로 역할 변경 - 팀 지원 적극적'
        WHEN 'supporter' THEN '3주차 팀장으로 역할 변경 - 리더십 발휘'
    END
FROM public.member_weekly_scores_2025_10_20_08_10 mws1
JOIN public.weekly_evaluations_2025_10_20_08_10 we1 ON mws1.evaluation_id = we1.id
JOIN public.weekly_evaluations_2025_10_20_08_10 we3 ON we1.group_id = we3.group_id
WHERE we1.week_number = 1 AND we3.week_number = 3;

-- 4. 4주차 역할 순환 (3주차와 동일 역할 유지)
INSERT INTO public.member_weekly_scores_2025_10_20_08_10 (
    evaluation_id, member_id, assigned_role, participated, role_completed,
    participation_score, role_score, activity_score, return_score, final_score, comment
)
SELECT 
    we4.id,
    mws3.member_id,
    mws3.assigned_role, -- 3주차와 동일 역할 유지
    CASE WHEN RANDOM() > 0.1 THEN true ELSE false END, -- 90% 참여율
    CASE WHEN RANDOM() > 0.2 THEN true ELSE false END, -- 80% 역할완료율
    mws3.participation_score,
    mws3.role_score,
    (15 + (RANDOM() * 5)::INT), -- 활동 점수
    mws3.return_score + (RANDOM() * 2)::INT, -- 수익률 점수 약간 변동
    0, -- final_score는 나중에 계산
    '4주차 ' || REPLACE(mws3.comment, '3주차 ', '')
FROM public.member_weekly_scores_2025_10_20_08_10 mws3
JOIN public.weekly_evaluations_2025_10_20_08_10 we3 ON mws3.evaluation_id = we3.id
JOIN public.weekly_evaluations_2025_10_20_08_10 we4 ON we3.group_id = we4.group_id
WHERE we3.week_number = 3 AND we4.week_number = 4;

-- 5. final_score 계산
UPDATE public.member_weekly_scores_2025_10_20_08_10 
SET final_score = participation_score + role_score + activity_score + return_score
WHERE final_score = 0;

-- 6. 역할별 의견 생성 (1-4주차)
INSERT INTO public.role_opinions_2025_10_20_08_10 (
    evaluation_id, role_key, opinion_text
)
SELECT 
    we.id,
    roles.role_key,
    CASE roles.role_key
        WHEN 'team_leader' THEN we.week_number || '주차 팀장은 팀을 잘 이끌어 주었고, 의사결정 과정에서 팀원들의 의견을 적극 수렴했습니다.'
        WHEN 'analyst' THEN we.week_number || '주차 분석가는 시장 분석이 정확했고, 투자 종목 선정에 도움이 되는 유용한 정보를 제공해주었습니다.'
        WHEN 'presenter' THEN we.week_number || '주차 발표자는 발표 준비를 철저히 했고, 팀의 성과를 명확하게 전달해주었습니다.'
        WHEN 'recorder' THEN we.week_number || '주차 기록자는 회의록과 투자 기록을 정확하게 작성해주어 팀 활동 추적에 도움이 되었습니다.'
        WHEN 'observer' THEN we.week_number || '주차 관찰자는 팀 활동을 객관적으로 관찰하고 건설적인 피드백을 제공해주었습니다.'
        WHEN 'supporter' THEN we.week_number || '주차 서포터는 팀원들을 적극 지원하고 팀 분위기를 좋게 만들어주었습니다.'
    END
FROM public.weekly_evaluations_2025_10_20_08_10 we
CROSS JOIN (
    SELECT 'team_leader' as role_key
    UNION SELECT 'analyst'
    UNION SELECT 'presenter'
    UNION SELECT 'recorder'
    UNION SELECT 'observer'
    UNION SELECT 'supporter'
) roles
WHERE we.week_number IN (1, 2, 3, 4);

-- 7. 생성 결과 확인
SELECT 
    '🎉 완전한 1-4주차 평가시스템 데이터 생성 완료!' as 메시지,
    COUNT(*)::text || '개 평가 기록 생성' as 상세
FROM public.member_weekly_scores_2025_10_20_08_10;