-- 참여도 평가 시스템 확장 테이블

-- 참여도 활동 유형 테이블
CREATE TABLE public.activity_types_2025_09_27_13_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  max_points INTEGER NOT NULL,
  evaluation_criteria TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 월별 참여도 기록 테이블
CREATE TABLE public.monthly_participation_2025_09_27_13_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.study_groups_2025_09_27_12_14(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  
  -- 각 활동별 점수
  offline_meeting_score INTEGER DEFAULT 0,
  report_writing_score INTEGER DEFAULT 0,
  team_mentoring_score INTEGER DEFAULT 0,
  cross_team_discussion_score INTEGER DEFAULT 0,
  chat_contribution_score INTEGER DEFAULT 0,
  resource_sharing_score INTEGER DEFAULT 0,
  
  -- 총점
  total_score INTEGER DEFAULT 0,
  
  -- 승인 상태
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by UUID REFERENCES public.user_profiles_2025_09_27_12_14(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, group_id, year, month)
);

-- 상세 활동 기록 테이블
CREATE TABLE public.activity_records_2025_09_27_13_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  monthly_participation_id UUID REFERENCES public.monthly_participation_2025_09_27_13_00(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('offline_meeting', 'report_writing', 'team_mentoring', 'cross_team_discussion', 'chat_contribution', 'resource_sharing')),
  
  title VARCHAR(200) NOT NULL,
  description TEXT,
  evidence_url TEXT, -- 증빙 자료 URL
  points_earned INTEGER DEFAULT 0,
  
  -- 활동별 추가 정보
  meeting_attendance_status VARCHAR(20), -- 'on_time', 'late', 'absent'
  ideas_shared_count INTEGER DEFAULT 0,
  reactions_count INTEGER DEFAULT 0, -- 좋아요, 댓글 수
  team_members_helped INTEGER DEFAULT 0,
  discussion_participation_level VARCHAR(20), -- 'presenter', 'active', 'passive'
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 팀별 레포트 제출 현황 테이블
CREATE TABLE public.team_reports_2025_09_27_13_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.study_groups_2025_09_27_12_14(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  
  total_members INTEGER NOT NULL,
  submitted_members INTEGER DEFAULT 0,
  submission_rate DECIMAL(5,2) DEFAULT 0,
  
  -- 제출한 멤버들
  submitted_member_ids UUID[] DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(group_id, year, month)
);

-- 톡방 기여 상세 기록 테이블
CREATE TABLE public.chat_contributions_2025_09_27_13_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.study_groups_2025_09_27_12_14(id) ON DELETE CASCADE,
  
  chat_type VARCHAR(20) NOT NULL CHECK (chat_type IN ('team_chat', 'general_chat')),
  content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('analysis', 'question', 'answer', 'resource', 'discussion')),
  
  title VARCHAR(200),
  content TEXT,
  
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  total_reactions INTEGER DEFAULT 0,
  
  points_earned INTEGER DEFAULT 0,
  
  posted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 자료 공유 기록 테이블
CREATE TABLE public.resource_shares_2025_09_27_13_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.study_groups_2025_09_27_12_14(id) ON DELETE CASCADE,
  
  title VARCHAR(200) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50) NOT NULL, -- 'pdf', 'excel', 'chart', 'summary', 'link'
  file_url TEXT,
  
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  
  points_earned INTEGER DEFAULT 0,
  
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE public.activity_types_2025_09_27_13_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_participation_2025_09_27_13_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_records_2025_09_27_13_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_reports_2025_09_27_13_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_contributions_2025_09_27_13_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_shares_2025_09_27_13_00 ENABLE ROW LEVEL SECURITY;

-- 활동 유형 정책
CREATE POLICY "Anyone can view activity types" ON public.activity_types_2025_09_27_13_00 FOR SELECT USING (true);

-- 월별 참여도 정책
CREATE POLICY "Users can view own participation" ON public.monthly_participation_2025_09_27_13_00 FOR SELECT USING (
  auth.uid() IN (SELECT user_id FROM public.user_profiles_2025_09_27_12_14 WHERE id = monthly_participation_2025_09_27_13_00.user_id)
);
CREATE POLICY "Users can insert own participation" ON public.monthly_participation_2025_09_27_13_00 FOR INSERT WITH CHECK (
  auth.uid() IN (SELECT user_id FROM public.user_profiles_2025_09_27_12_14 WHERE id = monthly_participation_2025_09_27_13_00.user_id)
);
CREATE POLICY "Users can update own participation" ON public.monthly_participation_2025_09_27_13_00 FOR UPDATE USING (
  auth.uid() IN (SELECT user_id FROM public.user_profiles_2025_09_27_12_14 WHERE id = monthly_participation_2025_09_27_13_00.user_id)
);

-- 그룹 멤버들은 서로의 참여도를 볼 수 있음
CREATE POLICY "Group members can view each other's participation" ON public.monthly_participation_2025_09_27_13_00 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships_2025_09_27_12_14 gm1
    JOIN public.group_memberships_2025_09_27_12_14 gm2 ON gm1.group_id = gm2.group_id
    JOIN public.user_profiles_2025_09_27_12_14 up1 ON gm1.user_id = up1.id
    JOIN public.user_profiles_2025_09_27_12_14 up2 ON gm2.user_id = up2.id
    WHERE up1.user_id = auth.uid() AND up2.id = monthly_participation_2025_09_27_13_00.user_id
  )
);

-- 활동 기록 정책
CREATE POLICY "Users can manage own activity records" ON public.activity_records_2025_09_27_13_00 FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.monthly_participation_2025_09_27_13_00 mp
    JOIN public.user_profiles_2025_09_27_12_14 up ON mp.user_id = up.id
    WHERE mp.id = activity_records_2025_09_27_13_00.monthly_participation_id 
    AND up.user_id = auth.uid()
  )
);

-- 팀 레포트 정책
CREATE POLICY "Group members can view team reports" ON public.team_reports_2025_09_27_13_00 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships_2025_09_27_12_14 gm
    JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
    WHERE up.user_id = auth.uid() AND gm.group_id = team_reports_2025_09_27_13_00.group_id
  )
);

-- 톡방 기여 정책
CREATE POLICY "Users can manage own chat contributions" ON public.chat_contributions_2025_09_27_13_00 FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM public.user_profiles_2025_09_27_12_14 WHERE id = chat_contributions_2025_09_27_13_00.user_id)
);
CREATE POLICY "Group members can view chat contributions" ON public.chat_contributions_2025_09_27_13_00 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships_2025_09_27_12_14 gm
    JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
    WHERE up.user_id = auth.uid() AND gm.group_id = chat_contributions_2025_09_27_13_00.group_id
  )
);

-- 자료 공유 정책
CREATE POLICY "Users can manage own resource shares" ON public.resource_shares_2025_09_27_13_00 FOR ALL USING (
  auth.uid() IN (SELECT user_id FROM public.user_profiles_2025_09_27_12_14 WHERE id = resource_shares_2025_09_27_13_00.user_id)
);
CREATE POLICY "Group members can view resource shares" ON public.resource_shares_2025_09_27_13_00 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships_2025_09_27_12_14 gm
    JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
    WHERE up.user_id = auth.uid() AND gm.group_id = resource_shares_2025_09_27_13_00.group_id
  )
);

-- 기본 활동 유형 데이터 삽입
INSERT INTO public.activity_types_2025_09_27_13_00 (name, description, max_points, evaluation_criteria) VALUES
('오프라인 모임 참석', '월 1회 진행되는 공식 오프라인 모임 참석 여부와 참여 태도 평가', 10, '정시 참석 및 적극적 참여도 포함'),
('레포트 작성', '레포트 양식 모두 작성', 10, '팀원 전원 제출 시 10점, 3명 이하 제출 시 0점'),
('팀 지원/멘토링', '팀원에게 실질적인 도움을 주거나 멘토링, 팀 사기 진작 활동', 20, '팀원 대상 피드백·멘토링·분석 제공 1회 이상'),
('타팀 토론 참여', '다른 팀과의 합동 토론, 크로스 미팅, 전체 스터디 토론 참여', 20, '발표, 질의응답 등 적극적 참여도 평가'),
('톡방 기여', '팀 내부 또는 전체 공용 톡방에서 질문·답변·자료 공유·분석 등으로 대화 품질에 기여', 20, '월 1회 이상 의미있는 글 업로드, 반응 수 기반 평가'),
('의미있는 자료 공유', '팀원들이 반복 활용할 수 있는 정리된 자료 제공', 5, '재사용 가능한 참고 자료 제공, 반응 수 기반 평가');