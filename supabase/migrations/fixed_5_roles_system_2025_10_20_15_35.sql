-- 5개 역할 평가시스템 수정 (WHERE절 윈도우 함수 오류 수정)

-- 1. 기존 역할 정의 삭제 후 새로운 5개 역할 정의
DELETE FROM public.role_definitions_2025_10_20_08_10;

INSERT INTO public.role_definitions_2025_10_20_08_10 (role_name, role_key, description, responsibilities, is_rotating, sort_order) VALUES
('전략리더', 'strategy_leader', '팀의 투자 방향성을 제시하고 의사결정을 이끄는 역할', '이번 2주 무엇을 볼지 핵심 질문 1~3개 제시, 팀 토론 진행 및 최종 투자 결정 책임', true, 1),
('리서치', 'researcher', '투자 관련 자료를 수집하고 분석하는 역할', '질문에 맞춰 자료·뉴스·지표를 모아 핵심 5줄 정리 (출처 필수), 객관적 데이터 기반 정보 제공', true, 2),
('요약분석', 'analyzer', '토론 결과를 정리하고 결론을 도출하는 역할', '토론 후 결론 3줄 (근거 포함) + 다음 액션 (매수/보류/관망), 팀의 의견을 종합하여 명확한 방향 제시', true, 3),
('리스크체커', 'risk_checker', '투자 위험을 점검하고 대안을 제시하는 역할', '반대 시나리오 2개 + 손절/축소 조건 제안, 위험 요소 사전 점검 및 리스크 관리 방안 수립', true, 4),
('기록·입력', 'recorder', '팀 활동을 기록하고 데이터를 입력하는 역할', '참여/역할 체크, 시작/종료/입출금 숫자 입력 (리더보드 자동), 팀 활동 전반의 기록 관리', true, 5);

-- 2. 기존 멤버 점수 데이터 삭제
DELETE FROM public.member_weekly_scores_2025_10_20_08_10;

-- 3. 1주차 5개 역할 배정 (서브쿼리 사용)
INSERT INTO public.member_weekly_scores_2025_10_20_08_10 (
    evaluation_id, member_id, assigned_role, participated, role_completed,
    participation_score, role_score, activity_score, return_score, final_score, comment
)
SELECT 
    we.id,
    team_members.member_id,
    team_members.assigned_role,
    true, -- 참여
    true, -- 역할 완료
    team_members.participation_score,
    team_members.role_score,
    (15 + (RANDOM() * 10)::INT), -- 활동 점수 15-25
    CASE team_members.team_name
        WHEN '프론티어팀' THEN (18 + (RANDOM() * 5)::INT)
        WHEN '써밋팀' THEN (16 + (RANDOM() * 5)::INT)
        WHEN '넥서스팀' THEN (15 + (RANDOM() * 5)::INT)
        WHEN '옵티머스팀' THEN (14 + (RANDOM() * 5)::INT)
        WHEN '모멘텀팀' THEN (13 + (RANDOM() * 5)::INT)
        WHEN '아틀라스팀' THEN (8 + (RANDOM() * 5)::INT)
        ELSE (12 + (RANDOM() * 5)::INT)
    END, -- 수익률 점수
    0, -- final_score는 나중에 계산
    team_members.comment
FROM (
    SELECT 
        up.id as member_id,
        sg.id as group_id,
        sg.name as team_name,
        CASE 
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN 'strategy_leader'
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN 'researcher'
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN 'analyzer'
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN 'risk_checker'
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN 'recorder'
        END as assigned_role,
        CASE 
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN 25 -- 전략리더
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN 22 -- 리서치
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN 20 -- 요약분석
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN 18 -- 리스크체커
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN 15 -- 기록·입력
        END as participation_score,
        CASE 
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN 30 -- 전략리더
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN 28 -- 리서치
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN 25 -- 요약분석
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN 23 -- 리스크체커
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN 20 -- 기록·입력
        END as role_score,
        CASE 
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 1 THEN '1주차 전략리더 역할을 훌륭히 수행했습니다'
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 2 THEN '1주차 리서치 자료 수집이 우수했습니다'
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 3 THEN '1주차 요약분석이 정확했습니다'
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 4 THEN '1주차 리스크 체크를 철저히 했습니다'
            WHEN ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) = 5 THEN '1주차 기록·입력을 성실히 했습니다'
        END as comment,
        ROW_NUMBER() OVER (PARTITION BY sg.id ORDER BY up.username) as member_rank
    FROM public.user_profiles_2025_09_27_12_14 up
    JOIN public.group_memberships_2025_09_27_12_14 gm ON up.id = gm.user_id
    JOIN public.study_groups_2025_09_27_12_14 sg ON gm.group_id = sg.id
    WHERE sg.name LIKE '%팀' AND up.username NOT IN ('admin', 'testuser')
) team_members
JOIN public.weekly_evaluations_2025_10_20_08_10 we ON team_members.group_id = we.group_id
WHERE team_members.member_rank <= 5 AND we.week_number = 1; -- 각 팀당 5명만

-- 4. 2주차 동일 역할 유지
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
    (15 + (RANDOM() * 10)::INT), -- 활동 점수 변동
    mws1.return_score + (RANDOM() * 3)::INT, -- 수익률 점수 약간 변동
    0, -- final_score는 나중에 계산
    '2주차 ' || REPLACE(mws1.comment, '1주차 ', '')
FROM public.member_weekly_scores_2025_10_20_08_10 mws1
JOIN public.weekly_evaluations_2025_10_20_08_10 we1 ON mws1.evaluation_id = we1.id
JOIN public.weekly_evaluations_2025_10_20_08_10 we2 ON we1.group_id = we2.group_id
WHERE we1.week_number = 1 AND we2.week_number = 2;

-- 5. 3주차 역할 순환 (전략리더→리서치→요약분석→리스크체커→기록입력→전략리더)
INSERT INTO public.member_weekly_scores_2025_10_20_08_10 (
    evaluation_id, member_id, assigned_role, participated, role_completed,
    participation_score, role_score, activity_score, return_score, final_score, comment
)
SELECT 
    we3.id,
    mws1.member_id,
    CASE mws1.assigned_role
        WHEN 'strategy_leader' THEN 'researcher'    -- 전략리더 → 리서치
        WHEN 'researcher' THEN 'analyzer'          -- 리서치 → 요약분석
        WHEN 'analyzer' THEN 'risk_checker'        -- 요약분석 → 리스크체커
        WHEN 'risk_checker' THEN 'recorder'        -- 리스크체커 → 기록입력
        WHEN 'recorder' THEN 'strategy_leader'     -- 기록입력 → 전략리더
    END, -- 역할 순환
    CASE WHEN RANDOM() > 0.15 THEN true ELSE false END, -- 85% 참여율
    CASE WHEN RANDOM() > 0.25 THEN true ELSE false END, -- 75% 역할완료율
    CASE mws1.assigned_role
        WHEN 'strategy_leader' THEN 22  -- 리서치 점수
        WHEN 'researcher' THEN 20       -- 요약분석 점수
        WHEN 'analyzer' THEN 18         -- 리스크체커 점수
        WHEN 'risk_checker' THEN 15     -- 기록입력 점수
        WHEN 'recorder' THEN 25         -- 전략리더 점수
    END,
    CASE mws1.assigned_role
        WHEN 'strategy_leader' THEN 28  -- 리서치 점수
        WHEN 'researcher' THEN 25       -- 요약분석 점수
        WHEN 'analyzer' THEN 23         -- 리스크체커 점수
        WHEN 'risk_checker' THEN 20     -- 기록입력 점수
        WHEN 'recorder' THEN 30         -- 전략리더 점수
    END,
    (15 + (RANDOM() * 10)::INT), -- 활동 점수
    mws1.return_score + (RANDOM() * 2)::INT, -- 수익률 점수 약간 변동
    0, -- final_score는 나중에 계산
    CASE mws1.assigned_role
        WHEN 'strategy_leader' THEN '3주차 리서치로 역할 변경 - 자료 수집 우수'
        WHEN 'researcher' THEN '3주차 요약분석으로 역할 변경 - 분석 능력 향상'
        WHEN 'analyzer' THEN '3주차 리스크체커로 역할 변경 - 위험 관리 철저'
        WHEN 'risk_checker' THEN '3주차 기록입력으로 역할 변경 - 데이터 관리 정확'
        WHEN 'recorder' THEN '3주차 전략리더로 역할 변경 - 리더십 발휘'
    END
FROM public.member_weekly_scores_2025_10_20_08_10 mws1
JOIN public.weekly_evaluations_2025_10_20_08_10 we1 ON mws1.evaluation_id = we1.id
JOIN public.weekly_evaluations_2025_10_20_08_10 we3 ON we1.group_id = we3.group_id
WHERE we1.week_number = 1 AND we3.week_number = 3;

-- 6. 4주차 동일 역할 유지
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
    (15 + (RANDOM() * 10)::INT), -- 활동 점수
    mws3.return_score + (RANDOM() * 2)::INT, -- 수익률 점수 약간 변동
    0, -- final_score는 나중에 계산
    '4주차 ' || REPLACE(mws3.comment, '3주차 ', '')
FROM public.member_weekly_scores_2025_10_20_08_10 mws3
JOIN public.weekly_evaluations_2025_10_20_08_10 we3 ON mws3.evaluation_id = we3.id
JOIN public.weekly_evaluations_2025_10_20_08_10 we4 ON we3.group_id = we4.group_id
WHERE we3.week_number = 3 AND we4.week_number = 4;

-- 7. final_score 계산
UPDATE public.member_weekly_scores_2025_10_20_08_10 
SET final_score = participation_score + role_score + activity_score + return_score
WHERE final_score = 0;

-- 8. 생성 결과 확인
SELECT 
    '🎉 5개 역할 평가시스템 수정 완료!' as 메시지,
    COUNT(*)::text || '개 평가 기록 (5개 역할 × 4주차)' as 상세
FROM public.member_weekly_scores_2025_10_20_08_10;