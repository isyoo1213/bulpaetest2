-- 새로운 평가시스템 데이터베이스 스키마 (수정버전)

-- 시스템 설정 테이블 (관리자 토글 기능)
CREATE TABLE public.system_settings_2025_10_20_08_10 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 역할 정의 테이블
CREATE TABLE public.role_definitions_2025_10_20_08_10 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name VARCHAR(50) NOT NULL,
  role_key VARCHAR(50) UNIQUE NOT NULL,
  description TEXT NOT NULL,
  responsibilities TEXT NOT NULL,
  is_rotating BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 주간 평가 기록 테이블
CREATE TABLE public.weekly_evaluations_2025_10_20_08_10 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.study_groups_2025_09_27_12_14(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  start_asset DECIMAL(15,2),
  end_asset DECIMAL(15,2),
  net_flow DECIMAL(15,2) DEFAULT 0,
  team_return_rate DECIMAL(8,4), -- 자동 계산된 수익률
  team_return_score DECIMAL(8,2), -- 자동 계산된 수익률 점수
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'locked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(group_id, week_number, year)
);

-- 개인별 주간 평가 테이블
CREATE TABLE public.member_weekly_scores_2025_10_20_08_10 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID REFERENCES public.weekly_evaluations_2025_10_20_08_10(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  assigned_role VARCHAR(50) NOT NULL,
  participated BOOLEAN DEFAULT false,
  role_completed BOOLEAN DEFAULT false,
  participation_score INTEGER DEFAULT 0, -- 자동 계산
  role_score INTEGER DEFAULT 0, -- 자동 계산
  activity_score INTEGER DEFAULT 0, -- 자동 계산 (CAP 30)
  return_score DECIMAL(8,2) DEFAULT 0, -- 자동 계산
  final_score DECIMAL(8,2) DEFAULT 0, -- 자동 계산 (최대 50)
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(evaluation_id, member_id)
);

-- 역할별 의견 작성 테이블
CREATE TABLE public.role_opinions_2025_10_20_08_10 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evaluation_id UUID REFERENCES public.weekly_evaluations_2025_10_20_08_10(id) ON DELETE CASCADE,
  role_key VARCHAR(50) NOT NULL,
  opinion_text TEXT,
  author_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(evaluation_id, role_key)
);

-- 팀 이미지 및 설정 테이블
CREATE TABLE public.team_settings_2025_10_20_08_10 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.study_groups_2025_09_27_12_14(id) ON DELETE CASCADE UNIQUE,
  team_image_url TEXT,
  team_color VARCHAR(7) DEFAULT '#3B82F6',
  team_slogan TEXT,
  team_goal TEXT,
  fixed_recorder_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 역할 순환 히스토리 테이블
CREATE TABLE public.role_rotation_history_2025_10_20_08_10 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.study_groups_2025_09_27_12_14(id) ON DELETE CASCADE,
  member_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  assigned_role VARCHAR(50) NOT NULL,
  rotation_cycle INTEGER NOT NULL, -- 순환 주기 (2주마다 증가)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(group_id, member_id, week_number, year)
);

-- RLS 정책 설정
ALTER TABLE public.system_settings_2025_10_20_08_10 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_definitions_2025_10_20_08_10 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_evaluations_2025_10_20_08_10 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_weekly_scores_2025_10_20_08_10 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_opinions_2025_10_20_08_10 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_settings_2025_10_20_08_10 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_rotation_history_2025_10_20_08_10 ENABLE ROW LEVEL SECURITY;

-- 시스템 설정 정책 (모든 사용자 조회 가능)
CREATE POLICY "Anyone can view system settings" ON public.system_settings_2025_10_20_08_10 FOR SELECT USING (true);

-- 역할 정의 정책 (모든 사용자 조회 가능)
CREATE POLICY "Anyone can view role definitions" ON public.role_definitions_2025_10_20_08_10 FOR SELECT USING (true);

-- 주간 평가 정책 (그룹 멤버만 조회)
CREATE POLICY "Group members can view evaluations" ON public.weekly_evaluations_2025_10_20_08_10 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships_2025_09_27_12_14 gm
    JOIN public.user_profiles_2025_09_27_12_14 up ON up.id = gm.user_id
    WHERE up.user_id = auth.uid() AND gm.group_id = weekly_evaluations_2025_10_20_08_10.group_id
  )
);

CREATE POLICY "Authenticated users can manage evaluations" ON public.weekly_evaluations_2025_10_20_08_10 FOR ALL USING (auth.role() = 'authenticated');

-- 개인 점수 정책 (그룹 멤버만 조회)
CREATE POLICY "Group members can view scores" ON public.member_weekly_scores_2025_10_20_08_10 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.weekly_evaluations_2025_10_20_08_10 we
    JOIN public.group_memberships_2025_09_27_12_14 gm ON gm.group_id = we.group_id
    JOIN public.user_profiles_2025_09_27_12_14 up ON up.id = gm.user_id
    WHERE up.user_id = auth.uid() AND we.id = member_weekly_scores_2025_10_20_08_10.evaluation_id
  )
);

CREATE POLICY "Authenticated users can manage scores" ON public.member_weekly_scores_2025_10_20_08_10 FOR ALL USING (auth.role() = 'authenticated');

-- 역할 의견 정책 (그룹 멤버만 조회 및 작성)
CREATE POLICY "Group members can view opinions" ON public.role_opinions_2025_10_20_08_10 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.weekly_evaluations_2025_10_20_08_10 we
    JOIN public.group_memberships_2025_09_27_12_14 gm ON gm.group_id = we.group_id
    JOIN public.user_profiles_2025_09_27_12_14 up ON up.id = gm.user_id
    WHERE up.user_id = auth.uid() AND we.id = role_opinions_2025_10_20_08_10.evaluation_id
  )
);

CREATE POLICY "Authenticated users can manage opinions" ON public.role_opinions_2025_10_20_08_10 FOR ALL USING (auth.role() = 'authenticated');

-- 팀 설정 정책 (그룹 멤버 조회)
CREATE POLICY "Group members can view team settings" ON public.team_settings_2025_10_20_08_10 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships_2025_09_27_12_14 gm
    JOIN public.user_profiles_2025_09_27_12_14 up ON up.id = gm.user_id
    WHERE up.user_id = auth.uid() AND gm.group_id = team_settings_2025_10_20_08_10.group_id
  )
);

CREATE POLICY "Authenticated users can manage team settings" ON public.team_settings_2025_10_20_08_10 FOR ALL USING (auth.role() = 'authenticated');

-- 역할 순환 히스토리 정책 (그룹 멤버만 조회)
CREATE POLICY "Group members can view rotation history" ON public.role_rotation_history_2025_10_20_08_10 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships_2025_09_27_12_14 gm
    JOIN public.user_profiles_2025_09_27_12_14 up ON up.id = gm.user_id
    WHERE up.user_id = auth.uid() AND gm.group_id = role_rotation_history_2025_10_20_08_10.group_id
  )
);

-- 인덱스 생성
CREATE INDEX idx_weekly_evaluations_group_week ON public.weekly_evaluations_2025_10_20_08_10(group_id, week_number, year);
CREATE INDEX idx_member_scores_evaluation ON public.member_weekly_scores_2025_10_20_08_10(evaluation_id);
CREATE INDEX idx_member_scores_member ON public.member_weekly_scores_2025_10_20_08_10(member_id);
CREATE INDEX idx_role_opinions_evaluation ON public.role_opinions_2025_10_20_08_10(evaluation_id);
CREATE INDEX idx_team_settings_group ON public.team_settings_2025_10_20_08_10(group_id);
CREATE INDEX idx_rotation_history_group_week ON public.role_rotation_history_2025_10_20_08_10(group_id, week_number, year);

-- 초기 데이터 삽입

-- 시스템 설정 초기값
INSERT INTO public.system_settings_2025_10_20_08_10 (setting_key, setting_value, description) VALUES
('features_enabled', '{"point_system": false, "report_marketplace": false, "badge_system": false, "reward_system": false}', '기능 활성화 설정'),
('evaluation_settings', '{"participation_score": 5, "role_score": 10, "activity_cap": 30, "return_score_max": 20, "final_score_max": 50}', '평가 점수 설정'),
('rotation_settings', '{"rotation_cycle_weeks": 2, "roles_per_cycle": 4}', '역할 순환 설정');

-- 역할 정의 초기 데이터
INSERT INTO public.role_definitions_2025_10_20_08_10 (role_name, role_key, description, responsibilities, is_rotating, sort_order) VALUES
('전략리더', 'strategy_leader', '팀의 투자 방향성을 제시하고 의사결정을 이끄는 역할', '이번 2주 무엇을 볼지, 핵심 질문 1~3개 제시(금리/환율/섹터 등). 팀 토론 진행 및 최종 투자 결정 책임.', true, 1),
('리서치', 'researcher', '투자 관련 자료를 수집하고 분석하는 역할', '질문에 맞춰 자료·뉴스·지표를 모아 핵심 5줄 정리(출처 필수). 객관적 데이터 기반 정보 제공.', true, 2),
('요약분석', 'analyzer', '토론 결과를 정리하고 결론을 도출하는 역할', '토론 후 결론 3줄(근거 포함) + 다음 액션(매수/보류/관망). 팀의 의견을 종합하여 명확한 방향 제시.', true, 3),
('리스크체커', 'risk_checker', '투자 위험을 점검하고 대안을 제시하는 역할', '반대 시나리오 2개 + 손절/축소 조건 제안. 위험 요소 사전 점검 및 리스크 관리 방안 수립.', true, 4),
('기록·입력', 'recorder', '팀 활동을 기록하고 데이터를 입력하는 역할', '참여/역할 체크, 시작/종료/입출금 숫자 입력(리더보드 자동). 팀 활동 전반의 기록 관리.', false, 5);

-- 기존 그룹에 대한 팀 설정 초기화
INSERT INTO public.team_settings_2025_10_20_08_10 (group_id, team_color, team_slogan)
SELECT id, '#3B82F6', '함께 성장하는 투자 스터디'
FROM public.study_groups_2025_09_27_12_14;

-- 자동 점수 계산 함수
CREATE OR REPLACE FUNCTION calculate_member_scores()
RETURNS TRIGGER AS $$
BEGIN
  -- 참여 점수 계산
  NEW.participation_score := CASE WHEN NEW.participated THEN 5 ELSE 0 END;
  
  -- 역할 점수 계산
  NEW.role_score := CASE WHEN NEW.role_completed THEN 10 ELSE 0 END;
  
  -- 활동 점수 계산 (CAP 30)
  NEW.activity_score := LEAST(NEW.participation_score + NEW.role_score, 30);
  
  -- 수익률 점수는 팀 수익률에서 가져옴
  SELECT COALESCE(team_return_score, 0) INTO NEW.return_score
  FROM public.weekly_evaluations_2025_10_20_08_10
  WHERE id = NEW.evaluation_id;
  
  -- 최종 점수 계산 (최대 50)
  NEW.final_score := LEAST(NEW.activity_score + NEW.return_score, 50);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 수익률 자동 계산 함수
CREATE OR REPLACE FUNCTION calculate_team_return()
RETURNS TRIGGER AS $$
BEGIN
  -- 수익률 계산: (종료 - 시작 - 순입출금) / 시작 * 100
  IF NEW.start_asset IS NOT NULL AND NEW.start_asset > 0 AND NEW.end_asset IS NOT NULL THEN
    NEW.team_return_rate := ((NEW.end_asset - NEW.start_asset - COALESCE(NEW.net_flow, 0)) / NEW.start_asset) * 100;
    
    -- 수익률 점수 계산: -5% = 0점, +5% = 20점 (선형)
    NEW.team_return_score := GREATEST(0, LEAST(20, ((NEW.team_return_rate + 5) / 10) * 20));
  ELSE
    NEW.team_return_rate := NULL;
    NEW.team_return_score := 0;
  END IF;
  
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER trigger_calculate_member_scores
  BEFORE INSERT OR UPDATE ON public.member_weekly_scores_2025_10_20_08_10
  FOR EACH ROW EXECUTE FUNCTION calculate_member_scores();

CREATE TRIGGER trigger_calculate_team_return
  BEFORE INSERT OR UPDATE ON public.weekly_evaluations_2025_10_20_08_10
  FOR EACH ROW EXECUTE FUNCTION calculate_team_return();

-- 수익률 변경 시 멤버 점수 업데이트 트리거
CREATE OR REPLACE FUNCTION update_member_scores_on_return_change()
RETURNS TRIGGER AS $$
BEGIN
  -- 해당 평가의 모든 멤버 점수 업데이트
  UPDATE public.member_weekly_scores_2025_10_20_08_10
  SET return_score = NEW.team_return_score,
      final_score = LEAST(activity_score + NEW.team_return_score, 50),
      updated_at = NOW()
  WHERE evaluation_id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_member_scores_on_return_change
  AFTER UPDATE OF team_return_score ON public.weekly_evaluations_2025_10_20_08_10
  FOR EACH ROW EXECUTE FUNCTION update_member_scores_on_return_change();