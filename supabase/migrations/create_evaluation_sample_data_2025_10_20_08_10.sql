-- 새로운 평가시스템 샘플 데이터 생성

-- 현재 주차 계산 (2025년 기준)
DO $$
DECLARE
    current_week INTEGER := EXTRACT(week FROM CURRENT_DATE);
    current_year INTEGER := EXTRACT(year FROM CURRENT_DATE);
    group_record RECORD;
    member_record RECORD;
    evaluation_id UUID;
    week_num INTEGER;
BEGIN
    -- 각 그룹에 대해 최근 4주간의 평가 데이터 생성
    FOR group_record IN 
        SELECT id, name FROM public.study_groups_2025_09_27_12_14
    LOOP
        -- 최근 4주간의 데이터 생성
        FOR week_num IN (current_week - 3)..(current_week) LOOP
            -- 주간 평가 생성
            INSERT INTO public.weekly_evaluations_2025_10_20_08_10 (
                group_id, 
                week_number, 
                year, 
                start_asset, 
                end_asset, 
                net_flow,
                status
            ) VALUES (
                group_record.id,
                week_num,
                current_year,
                10000000 + (RANDOM() * 2000000)::INTEGER, -- 1000만원 ~ 1200만원
                10000000 + (RANDOM() * 3000000)::INTEGER, -- 1000만원 ~ 1300만원
                (RANDOM() * 200000 - 100000)::INTEGER, -- -10만원 ~ +10만원
                CASE WHEN week_num = current_week THEN 'draft' ELSE 'completed' END
            )
            ON CONFLICT (group_id, week_number, year) DO NOTHING
            RETURNING id INTO evaluation_id;

            -- 평가가 생성된 경우에만 멤버 점수 생성
            IF evaluation_id IS NOT NULL THEN
                -- 해당 그룹의 멤버들에 대한 점수 생성
                FOR member_record IN 
                    SELECT 
                        up.id as member_id,
                        up.full_name,
                        ROW_NUMBER() OVER (ORDER BY up.id) - 1 as member_index
                    FROM public.group_memberships_2025_09_27_12_14 gm
                    JOIN public.user_profiles_2025_09_27_12_14 up ON up.id = gm.user_id
                    WHERE gm.group_id = group_record.id
                LOOP
                    -- 역할 계산 (2주마다 순환)
                    DECLARE
                        role_cycle INTEGER := (week_num / 2);
                        role_index INTEGER := (member_record.member_index + role_cycle) % 4;
                        assigned_role VARCHAR(50);
                        participated BOOLEAN := RANDOM() > 0.1; -- 90% 참여율
                        role_completed BOOLEAN := participated AND RANDOM() > 0.2; -- 80% 역할 완수율
                    BEGIN
                        -- 역할 배정
                        CASE role_index
                            WHEN 0 THEN assigned_role := 'strategy_leader';
                            WHEN 1 THEN assigned_role := 'researcher';
                            WHEN 2 THEN assigned_role := 'analyzer';
                            WHEN 3 THEN assigned_role := 'risk_checker';
                            ELSE assigned_role := 'recorder';
                        END CASE;

                        -- 첫 번째 멤버는 기록자로 고정 (순환하지 않음)
                        IF member_record.member_index = 0 THEN
                            assigned_role := 'recorder';
                        END IF;

                        -- 멤버 점수 삽입
                        INSERT INTO public.member_weekly_scores_2025_10_20_08_10 (
                            evaluation_id,
                            member_id,
                            assigned_role,
                            participated,
                            role_completed,
                            comment
                        ) VALUES (
                            evaluation_id,
                            member_record.member_id,
                            assigned_role,
                            participated,
                            role_completed,
                            CASE 
                                WHEN role_completed THEN '역할을 성실히 수행했습니다.'
                                WHEN participated THEN '참여했지만 역할 수행이 미흡했습니다.'
                                ELSE '참여하지 않았습니다.'
                            END
                        );
                    END;
                END LOOP;

                -- 역할별 의견 샘플 생성
                INSERT INTO public.role_opinions_2025_10_20_08_10 (evaluation_id, role_key, opinion_text, author_id) VALUES
                (evaluation_id, 'strategy_leader', '이번 주는 금리 인상 가능성에 집중했습니다. 은행주와 보험주에 대한 관심이 높아지고 있어 관련 종목들을 검토했습니다.', 
                 (SELECT member_id FROM public.member_weekly_scores_2025_10_20_08_10 WHERE evaluation_id = evaluation_id AND assigned_role = 'strategy_leader' LIMIT 1)),
                
                (evaluation_id, 'researcher', '연준 의사록과 최근 경제지표를 분석했습니다. CPI 상승률이 예상보다 높게 나와 금리 인상 압박이 커지고 있습니다. 관련 뉴스와 전문가 의견을 종합했습니다.', 
                 (SELECT member_id FROM public.member_weekly_scores_2025_10_20_08_10 WHERE evaluation_id = evaluation_id AND assigned_role = 'researcher' LIMIT 1)),
                
                (evaluation_id, 'analyzer', '팀 토론 결과 금융주 비중을 늘리기로 결정했습니다. 특히 KB금융과 신한지주에 관심을 두고 있으며, 다음 주에 매수 타이밍을 잡을 예정입니다.', 
                 (SELECT member_id FROM public.member_weekly_scores_2025_10_20_08_10 WHERE evaluation_id = evaluation_id AND assigned_role = 'analyzer' LIMIT 1)),
                
                (evaluation_id, 'risk_checker', '금리 인상이 예상보다 급격할 경우 성장주 타격이 클 수 있습니다. 포트폴리오의 30% 이상을 성장주가 차지하고 있어 일부 비중 조절이 필요할 것 같습니다.', 
                 (SELECT member_id FROM public.member_weekly_scores_2025_10_20_08_10 WHERE evaluation_id = evaluation_id AND assigned_role = 'risk_checker' LIMIT 1));

            END IF;
        END LOOP;
    END LOOP;

    -- 역할 순환 히스토리 생성
    FOR group_record IN 
        SELECT id FROM public.study_groups_2025_09_27_12_14
    LOOP
        FOR week_num IN (current_week - 3)..(current_week) LOOP
            INSERT INTO public.role_rotation_history_2025_10_20_08_10 (
                group_id,
                member_id,
                week_number,
                year,
                assigned_role,
                rotation_cycle
            )
            SELECT 
                group_record.id,
                mws.member_id,
                week_num,
                current_year,
                mws.assigned_role,
                (week_num / 2) + 1
            FROM public.member_weekly_scores_2025_10_20_08_10 mws
            JOIN public.weekly_evaluations_2025_10_20_08_10 we ON we.id = mws.evaluation_id
            WHERE we.group_id = group_record.id AND we.week_number = week_num AND we.year = current_year
            ON CONFLICT (group_id, member_id, week_number, year) DO NOTHING;
        END LOOP;
    END LOOP;

END $$;

-- 팀 설정 업데이트 (색상과 슬로건 다양화)
UPDATE public.team_settings_2025_10_20_08_10 
SET 
    team_color = CASE 
        WHEN RANDOM() < 0.2 THEN '#EF4444'  -- 빨강
        WHEN RANDOM() < 0.4 THEN '#10B981'  -- 초록
        WHEN RANDOM() < 0.6 THEN '#8B5CF6'  -- 보라
        WHEN RANDOM() < 0.8 THEN '#F59E0B'  -- 주황
        ELSE '#3B82F6'  -- 파랑 (기본)
    END,
    team_slogan = CASE 
        WHEN RANDOM() < 0.25 THEN '함께 성장하는 투자 스터디'
        WHEN RANDOM() < 0.5 THEN '데이터 기반 투자 전략'
        WHEN RANDOM() < 0.75 THEN '안정적인 수익 추구'
        ELSE '혁신적인 투자 아이디어'
    END,
    team_goal = '2025년 목표 수익률 15% 달성을 위해 체계적인 분석과 토론을 통한 투자 역량 강화'
WHERE team_slogan = '함께 성장하는 투자 스터디';

-- 통계 확인 쿼리
SELECT 
    '주간 평가 데이터' as 구분,
    COUNT(*) as 개수
FROM public.weekly_evaluations_2025_10_20_08_10

UNION ALL

SELECT 
    '멤버 점수 데이터' as 구분,
    COUNT(*) as 개수
FROM public.member_weekly_scores_2025_10_20_08_10

UNION ALL

SELECT 
    '역할별 의견 데이터' as 구분,
    COUNT(*) as 개수
FROM public.role_opinions_2025_10_20_08_10

UNION ALL

SELECT 
    '역할 순환 히스토리' as 구분,
    COUNT(*) as 개수
FROM public.role_rotation_history_2025_10_20_08_10;