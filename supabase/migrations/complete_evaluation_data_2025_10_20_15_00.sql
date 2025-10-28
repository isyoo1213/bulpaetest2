-- 평가시스템 완전 데이터 생성 (1-4주차 + 2주 순환)

-- 1. 기존 평가 데이터 정리
DELETE FROM public.member_weekly_scores_2025_10_20_08_10;
DELETE FROM public.weekly_evaluations_2025_10_20_08_10;

-- 2. 1-4주차 주간 평가 생성 (각 팀별로)
INSERT INTO public.weekly_evaluations_2025_10_20_08_10 (
    group_id, week_number, year, start_asset, end_asset, net_flow, 
    team_return_rate, team_return_score, status
)
SELECT 
    sg.id,
    week_num,
    2025,
    10000000, -- 시작 자산
    CASE sg.name
        WHEN '프론티어팀' THEN 10000000 + (week_num * 475000)  -- 주차별 증가
        WHEN '써밋팀' THEN 10000000 + (week_num * 360000)
        WHEN '넥서스팀' THEN 10000000 + (week_num * 290000)
        WHEN '옵티머스팀' THEN 10000000 + (week_num * 180000)
        WHEN '모멘텀팀' THEN 10000000 + (week_num * 170000)
        WHEN '아틀라스팀' THEN 10000000 - (week_num * 430000)
        ELSE 10000000 + (week_num * 100000)
    END, -- 종료 자산
    0, -- 순 유입
    CASE sg.name
        WHEN '프론티어팀' THEN 14.75 + (week_num * 0.5)
        WHEN '써밋팀' THEN 13.6 + (week_num * 0.4)
        WHEN '넥서스팀' THEN 12.9 + (week_num * 0.3)
        WHEN '옵티머스팀' THEN 11.8 + (week_num * 0.2)
        WHEN '모멘텀팀' THEN 11.7 + (week_num * 0.1)
        WHEN '아틀라스팀' THEN -4.3 - (week_num * 0.3)
        ELSE 5.0 + (week_num * 0.1)
    END, -- 팀 수익률
    CASE sg.name
        WHEN '프론티어팀' THEN 95 - (week_num * 2)
        WHEN '써밋팀' THEN 85 - (week_num * 2)
        WHEN '넥서스팀' THEN 80 - (week_num * 2)
        WHEN '옵티머스팀' THEN 75 - (week_num * 2)
        WHEN '모멘텀팀' THEN 70 - (week_num * 2)
        WHEN '아틀라스팀' THEN 30 - (week_num * 2)
        ELSE 60 - (week_num * 2)
    END, -- 팀 수익률 점수
    'completed'
FROM public.study_groups_2025_09_27_12_14 sg
CROSS JOIN (SELECT generate_series(1, 4) as week_num) weeks
WHERE sg.name LIKE '%팀';

-- 3. 1-2주차 역할 배정 (현재 역할 유지)
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
    CASE WHEN RANDOM() > 0.1 THEN true ELSE false END, -- 90% 참여율
    CASE WHEN RANDOM() > 0.2 THEN true ELSE false END, -- 80% 역할완료율
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN 20 -- 팀장
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN 18 -- 분석가
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN 16 -- 발표자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN 15 -- 기록자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN 14 -- 관찰자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 6 THEN 13 -- 서포터
    END,
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN 25 -- 팀장
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN 23 -- 분석가
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN 21 -- 발표자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN 19 -- 기록자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN 17 -- 관찰자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 6 THEN 15 -- 서포터
    END,
    (15 + (RANDOM() * 5)::INT), -- 활동 점수 15-20
    CASE sg.name
        WHEN '프론티어팀' THEN (18 + (RANDOM() * 5)::INT)
        WHEN '써밋팀' THEN (16 + (RANDOM() * 5)::INT)
        WHEN '넥서스팀' THEN (15 + (RANDOM() * 5)::INT)
        WHEN '옵티머스팀' THEN (14 + (RANDOM() * 5)::INT)
        WHEN '모멘텀팀' THEN (13 + (RANDOM() * 5)::INT)
        WHEN '아틀라스팀' THEN (8 + (RANDOM() * 5)::INT)
        ELSE (12 + (RANDOM() * 5)::INT)
    END,
    0, -- final_score는 나중에 계산
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN we.week_number || '주차 팀장 역할을 훌륭히 수행했습니다'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN we.week_number || '주차 시장 분석이 정확했습니다'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN we.week_number || '주차 발표 준비를 잘 했습니다'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN we.week_number || '주차 기록을 성실히 작성했습니다'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN we.week_number || '주차 객관적 관찰을 잘 했습니다'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 6 THEN we.week_number || '주차 팀원 지원을 잘 했습니다'
    END
FROM public.weekly_evaluations_2025_10_20_08_10 we
JOIN public.study_groups_2025_09_27_12_14 sg ON we.group_id = sg.id
JOIN public.group_memberships_2025_09_27_12_14 gm ON sg.id = gm.group_id
JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
WHERE sg.name LIKE '%팀' AND we.week_number IN (1, 2) AND up.username NOT IN ('admin', 'testuser');

-- 4. 3-4주차 역할 순환 배정 (역할이 한 칸씩 밀림)
INSERT INTO public.member_weekly_scores_2025_10_20_08_10 (
    evaluation_id, member_id, assigned_role, participated, role_completed,
    participation_score, role_score, activity_score, return_score, final_score, comment
)
SELECT 
    we.id,
    up.id,
    CASE 
        -- 역할 순환: 팀장→분석가→발표자→기록자→관찰자→서포터→팀장
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN 'analyst'    -- 팀장 → 분석가
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN 'presenter'  -- 분석가 → 발표자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN 'recorder'   -- 발표자 → 기록자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN 'observer'   -- 기록자 → 관찰자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN 'supporter'  -- 관찰자 → 서포터
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 6 THEN 'team_leader' -- 서포터 → 팀장
    END,
    CASE WHEN RANDOM() > 0.15 THEN true ELSE false END, -- 85% 참여율
    CASE WHEN RANDOM() > 0.25 THEN true ELSE false END, -- 75% 역할완료율
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN 18 -- 분석가
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN 16 -- 발표자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN 15 -- 기록자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN 14 -- 관찰자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN 13 -- 서포터
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 6 THEN 20 -- 팀장
    END,
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN 23 -- 분석가
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN 21 -- 발표자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN 19 -- 기록자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN 17 -- 관찰자
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN 15 -- 서포터
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 6 THEN 25 -- 팀장
    END,
    (15 + (RANDOM() * 5)::INT), -- 활동 점수 15-20
    CASE sg.name
        WHEN '프론티어팀' THEN (18 + (RANDOM() * 5)::INT)
        WHEN '써밋팀' THEN (16 + (RANDOM() * 5)::INT)
        WHEN '넥서스팀' THEN (15 + (RANDOM() * 5)::INT)
        WHEN '옵티머스팀' THEN (14 + (RANDOM() * 5)::INT)
        WHEN '모멘텀팀' THEN (13 + (RANDOM() * 5)::INT)
        WHEN '아틀라스팀' THEN (8 + (RANDOM() * 5)::INT)
        ELSE (12 + (RANDOM() * 5)::INT)
    END,
    0, -- final_score는 나중에 계산
    CASE 
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN we.week_number || '주차 분석가로 역할 변경 - 시장 분석 우수'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN we.week_number || '주차 발표자로 역할 변경 - 발표 실력 향상'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN we.week_number || '주차 기록자로 역할 변경 - 기록 관리 체계적'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN we.week_number || '주차 관찰자로 역할 변경 - 객관적 시각 제공'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN we.week_number || '주차 서포터로 역할 변경 - 팀 지원 적극적'
        WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 6 THEN we.week_number || '주차 팀장으로 역할 변경 - 리더십 발휘'
    END
FROM public.weekly_evaluations_2025_10_20_08_10 we
JOIN public.study_groups_2025_09_27_12_14 sg ON we.group_id = sg.id
JOIN public.group_memberships_2025_09_27_12_14 gm ON sg.id = gm.group_id
JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
WHERE sg.name LIKE '%팀' AND we.week_number IN (3, 4) AND up.username NOT IN ('admin', 'testuser');

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
    '🎉 완전한 평가시스템 데이터 생성 완료!' as 메시지,
    '1-4주차 × 6개팀 × 6명 = 144개 평가 기록' as 상세

UNION ALL

SELECT 
    '✅ 주차별 평가 현황' as 메시지,
    '주차 ' || week_number || ': ' || COUNT(*)::text || '개 평가' as 상세
FROM public.weekly_evaluations_2025_10_20_08_10
GROUP BY week_number
ORDER BY week_number

UNION ALL

SELECT 
    '✅ 역할 순환 확인' as 메시지,
    '1-2주차 vs 3-4주차 역할 변경 완료' as 상세

UNION ALL

SELECT 
    '✅ 참여도 통계' as 메시지,
    '참여율: ' || ROUND(AVG(CASE WHEN participated THEN 1.0 ELSE 0.0 END) * 100, 1)::text || '%, 역할완료율: ' || ROUND(AVG(CASE WHEN role_completed THEN 1.0 ELSE 0.0 END) * 100, 1)::text || '%' as 상세
FROM public.member_weekly_scores_2025_10_20_08_10;