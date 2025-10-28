-- 참여도 시스템 샘플 데이터 생성

-- 현재 월(9월) 월별 참여도 기록 생성
INSERT INTO public.monthly_participation_2025_09_27_13_00 (user_id, group_id, year, month, offline_meeting_score, report_writing_score, team_mentoring_score, cross_team_discussion_score, chat_contribution_score, resource_sharing_score, total_score, status) VALUES
-- 김투자 (불패 B팀)
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim'), 
 (SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 B팀'), 
 2024, 9, 10, 10, 20, 15, 20, 5, 80, 'approved'),

-- 박주식 (불패 A팀)
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park'), 
 (SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀'), 
 2024, 9, 10, 10, 20, 20, 20, 5, 85, 'approved'),

-- 정성장 (불패 A팀)
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'growth_jung'), 
 (SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀'), 
 2024, 9, 8, 0, 20, 10, 15, 3, 56, 'pending'),

-- 이트레이더 (불패 A팀)
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'trader_lee'), 
 (SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀'), 
 2024, 9, 5, 10, 0, 15, 10, 0, 40, 'pending'),

-- 최가치 (불패 B팀)
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'value_choi'), 
 (SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 B팀'), 
 2024, 9, 10, 10, 20, 0, 15, 5, 60, 'approved');

-- 상세 활동 기록 생성
-- 김투자의 활동 기록
INSERT INTO public.activity_records_2025_09_27_13_00 (monthly_participation_id, activity_type, title, description, points_earned, meeting_attendance_status, ideas_shared_count, reactions_count, team_members_helped, discussion_participation_level) VALUES
((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim') AND year = 2024 AND month = 9), 
 'offline_meeting', '9월 정기 모임 참석', '정시 참석하여 네이버 플랫폼 사업 분석 2건 공유', 10, 'on_time', 2, 0, 0, null),

((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim') AND year = 2024 AND month = 9), 
 'team_mentoring', '신규 팀원 포트폴리오 피드백', '최가치님의 은행주 포트폴리오에 대한 상세 피드백 제공', 20, null, 0, 0, 1, null),

((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim') AND year = 2024 AND month = 9), 
 'cross_team_discussion', 'A팀과 합동 토론 참여', 'ETF 리밸런싱 전략에 대한 질의응답 참여', 15, null, 0, 0, 0, 'active'),

((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim') AND year = 2024 AND month = 9), 
 'chat_contribution', '미국 CPI 발표 후 차트 분석', 'CPI 발표 후 차트 + 해설 공유로 팀원들에게 도움', 20, null, 0, 7, 0, null),

((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim') AND year = 2024 AND month = 9), 
 'resource_sharing', 'ETF 종목별 특징 정리 엑셀', '팀원들이 활용할 수 있는 ETF 비교 분석 자료 제공', 5, null, 0, 6, 0, null);

-- 박주식의 활동 기록
INSERT INTO public.activity_records_2025_09_27_13_00 (monthly_participation_id, activity_type, title, description, points_earned, meeting_attendance_status, ideas_shared_count, reactions_count, team_members_helped, discussion_participation_level) VALUES
((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park') AND year = 2024 AND month = 9), 
 'offline_meeting', '9월 정기 모임 참석 및 발표', '정시 참석하여 바이오 섹터 분석 발표 진행', 10, 'on_time', 3, 0, 0, null),

((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park') AND year = 2024 AND month = 9), 
 'team_mentoring', '팀원 멘토링 및 사기 진작', '정성장님과 이트레이더님에게 투자 전략 멘토링 제공', 20, null, 0, 0, 2, null),

((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park') AND year = 2024 AND month = 9), 
 'cross_team_discussion', 'B팀과 합동 토론 발표', '바이오 섹터 투자 전략 발표 및 질의응답 진행', 20, null, 0, 0, 0, 'presenter'),

((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park') AND year = 2024 AND month = 9), 
 'chat_contribution', '삼성바이오로직스 분석글', '4공장 완공 일정과 실적 전망에 대한 상세 분석 공유', 20, null, 0, 8, 0, null),

((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park') AND year = 2024 AND month = 9), 
 'resource_sharing', '바이오 기업 실적 비교표', '국내 주요 바이오 기업들의 실적 비교 분석 자료', 5, null, 0, 5, 0, null);

-- 정성장의 활동 기록
INSERT INTO public.activity_records_2025_09_27_13_00 (monthly_participation_id, activity_type, title, description, points_earned, meeting_attendance_status, ideas_shared_count, reactions_count, team_members_helped, discussion_participation_level) VALUES
((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'growth_jung') AND year = 2024 AND month = 9), 
 'offline_meeting', '9월 정기 모임 지각 참석', '20분 지각했지만 게임주 분석 1건 공유', 8, 'late', 1, 0, 0, null),

((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'growth_jung') AND year = 2024 AND month = 9), 
 'team_mentoring', '이트레이더님 게임주 추천', '넷마블 투자 전략에 대한 조언 제공', 20, null, 0, 0, 1, null),

((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'growth_jung') AND year = 2024 AND month = 9), 
 'cross_team_discussion', 'B팀과 게임주 토론', '게임 업계 전망에 대한 소극적 참여', 10, null, 0, 0, 0, 'passive'),

((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'growth_jung') AND year = 2024 AND month = 9), 
 'chat_contribution', '게임주 반등 시나리오', '모바일 게임 시장 회복 전망에 대한 분석', 15, null, 0, 4, 0, null),

((SELECT id FROM public.monthly_participation_2025_09_27_13_00 WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'growth_jung') AND year = 2024 AND month = 9), 
 'resource_sharing', '게임 업계 뉴스 링크', '단순 링크 공유로 반응 부족', 3, null, 0, 3, 0, null);

-- 팀별 레포트 제출 현황
INSERT INTO public.team_reports_2025_09_27_13_00 (group_id, year, month, total_members, submitted_members, submission_rate, submitted_member_ids) VALUES
-- 불패 A팀 (3명 중 2명 제출)
((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀'), 
 2024, 9, 3, 2, 66.67, 
 ARRAY[(SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park'), 
       (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'trader_lee')]),

-- 불패 B팀 (2명 모두 제출)
((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 B팀'), 
 2024, 9, 2, 2, 100.00, 
 ARRAY[(SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim'), 
       (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'value_choi')]);

-- 톡방 기여 기록
INSERT INTO public.chat_contributions_2025_09_27_13_00 (user_id, group_id, chat_type, content_type, title, content, likes_count, comments_count, total_reactions, points_earned) VALUES
-- 김투자의 톡방 기여
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim'),
 (SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 B팀'),
 'team_chat', 'analysis', '미국 CPI 발표 분석', 'CPI 상승률이 예상보다 낮게 나왔네요. 금리 인하 기대감이 높아질 것 같습니다.', 4, 3, 7, 20),

-- 박주식의 톡방 기여
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park'),
 (SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀'),
 'general_chat', 'analysis', '삼성바이오로직스 4공장 분석', '4공장 완공이 내년 상반기로 예정되어 있어 실적 개선이 기대됩니다.', 5, 3, 8, 20);

-- 자료 공유 기록
INSERT INTO public.resource_shares_2025_09_27_13_00 (user_id, group_id, title, description, resource_type, likes_count, comments_count, download_count, points_earned) VALUES
-- 김투자의 자료 공유
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim'),
 (SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 B팀'),
 'ETF 종목별 특징 비교표', '국내외 주요 ETF들의 수수료, 구성종목, 성과 비교 분석', 'excel', 4, 2, 8, 5),

-- 박주식의 자료 공유
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park'),
 (SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀'),
 '바이오 기업 실적 비교 차트', '삼성바이오로직스, 셀트리온 등 주요 바이오 기업 실적 추이', 'chart', 3, 2, 6, 5);