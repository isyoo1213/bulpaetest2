-- 불패스터디 대시보드 데이터베이스 스키마

-- 사용자 프로필 테이블
CREATE TABLE public.user_profiles_2025_09_27_12_14 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  avatar_url TEXT,
  initial_capital DECIMAL(15,2) DEFAULT 0,
  current_capital DECIMAL(15,2) DEFAULT 0,
  total_return_rate DECIMAL(5,2) DEFAULT 0,
  participation_score INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 스터디 그룹 테이블
CREATE TABLE public.study_groups_2025_09_27_12_14 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  leader_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id),
  max_members INTEGER DEFAULT 10,
  current_members INTEGER DEFAULT 0,
  group_score DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 그룹 멤버십 테이블
CREATE TABLE public.group_memberships_2025_09_27_12_14 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.study_groups_2025_09_27_12_14(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  role VARCHAR(20) DEFAULT 'member',
  UNIQUE(user_id, group_id)
);

-- 투자 기록 테이블
CREATE TABLE public.investment_records_2025_09_27_12_14 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  stock_code VARCHAR(20) NOT NULL,
  stock_name VARCHAR(100) NOT NULL,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  transaction_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 포트폴리오 현황 테이블
CREATE TABLE public.portfolio_holdings_2025_09_27_12_14 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  stock_code VARCHAR(20) NOT NULL,
  stock_name VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  avg_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) DEFAULT 0,
  total_value DECIMAL(15,2) DEFAULT 0,
  unrealized_pnl DECIMAL(15,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, stock_code)
);

-- 투자 아이디어 게시판
CREATE TABLE public.investment_ideas_2025_09_27_12_14 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  group_id UUID REFERENCES public.study_groups_2025_09_27_12_14(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  stock_code VARCHAR(20),
  stock_name VARCHAR(100),
  target_price DECIMAL(10,2),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 댓글 테이블
CREATE TABLE public.comments_2025_09_27_12_14 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  idea_id UUID REFERENCES public.investment_ideas_2025_09_27_12_14(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 업적/배지 테이블
CREATE TABLE public.achievements_2025_09_27_12_14 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  condition_type VARCHAR(50) NOT NULL,
  condition_value INTEGER NOT NULL,
  points INTEGER DEFAULT 0
);

-- 사용자 업적 테이블
CREATE TABLE public.user_achievements_2025_09_27_12_14 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements_2025_09_27_12_14(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- 참여도 기록 테이블
CREATE TABLE public.participation_logs_2025_09_27_12_14 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL,
  points INTEGER DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE public.user_profiles_2025_09_27_12_14 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_groups_2025_09_27_12_14 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_memberships_2025_09_27_12_14 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_records_2025_09_27_12_14 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_holdings_2025_09_27_12_14 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_ideas_2025_09_27_12_14 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments_2025_09_27_12_14 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements_2025_09_27_12_14 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participation_logs_2025_09_27_12_14 ENABLE ROW LEVEL SECURITY;

-- 사용자 프로필 정책
CREATE POLICY "Users can view all profiles" ON public.user_profiles_2025_09_27_12_14 FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles_2025_09_27_12_14 FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.user_profiles_2025_09_27_12_14 FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 그룹 정책
CREATE POLICY "Anyone can view groups" ON public.study_groups_2025_09_27_12_14 FOR SELECT USING (true);
CREATE POLICY "Group leaders can update groups" ON public.study_groups_2025_09_27_12_14 FOR UPDATE USING (auth.uid() IN (SELECT user_id FROM public.user_profiles_2025_09_27_12_14 WHERE id = leader_id));

-- 그룹 멤버십 정책
CREATE POLICY "Users can view group memberships" ON public.group_memberships_2025_09_27_12_14 FOR SELECT USING (true);
CREATE POLICY "Users can manage own membership" ON public.group_memberships_2025_09_27_12_14 FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.user_profiles_2025_09_27_12_14 WHERE id = group_memberships_2025_09_27_12_14.user_id));

-- 투자 기록 정책
CREATE POLICY "Users can manage own investment records" ON public.investment_records_2025_09_27_12_14 FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.user_profiles_2025_09_27_12_14 WHERE id = investment_records_2025_09_27_12_14.user_id));
CREATE POLICY "Group members can view each other's records" ON public.investment_records_2025_09_27_12_14 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships_2025_09_27_12_14 gm1
    JOIN public.group_memberships_2025_09_27_12_14 gm2 ON gm1.group_id = gm2.group_id
    JOIN public.user_profiles_2025_09_27_12_14 up1 ON gm1.user_id = up1.id
    JOIN public.user_profiles_2025_09_27_12_14 up2 ON gm2.user_id = up2.id
    WHERE up1.user_id = auth.uid() AND up2.id = investment_records_2025_09_27_12_14.user_id
  )
);

-- 포트폴리오 정책
CREATE POLICY "Users can manage own portfolio" ON public.portfolio_holdings_2025_09_27_12_14 FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.user_profiles_2025_09_27_12_14 WHERE id = portfolio_holdings_2025_09_27_12_14.user_id));
CREATE POLICY "Group members can view each other's portfolio" ON public.portfolio_holdings_2025_09_27_12_14 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships_2025_09_27_12_14 gm1
    JOIN public.group_memberships_2025_09_27_12_14 gm2 ON gm1.group_id = gm2.group_id
    JOIN public.user_profiles_2025_09_27_12_14 up1 ON gm1.user_id = up1.id
    JOIN public.user_profiles_2025_09_27_12_14 up2 ON gm2.user_id = up2.id
    WHERE up1.user_id = auth.uid() AND up2.id = portfolio_holdings_2025_09_27_12_14.user_id
  )
);

-- 투자 아이디어 정책
CREATE POLICY "Group members can view ideas" ON public.investment_ideas_2025_09_27_12_14 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships_2025_09_27_12_14 gm
    JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
    WHERE up.user_id = auth.uid() AND gm.group_id = investment_ideas_2025_09_27_12_14.group_id
  )
);
CREATE POLICY "Users can manage own ideas" ON public.investment_ideas_2025_09_27_12_14 FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.user_profiles_2025_09_27_12_14 WHERE id = investment_ideas_2025_09_27_12_14.user_id));

-- 댓글 정책
CREATE POLICY "Users can view comments on accessible ideas" ON public.comments_2025_09_27_12_14 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.investment_ideas_2025_09_27_12_14 ii
    JOIN public.group_memberships_2025_09_27_12_14 gm ON ii.group_id = gm.group_id
    JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
    WHERE up.user_id = auth.uid() AND ii.id = comments_2025_09_27_12_14.idea_id
  )
);
CREATE POLICY "Users can manage own comments" ON public.comments_2025_09_27_12_14 FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.user_profiles_2025_09_27_12_14 WHERE id = comments_2025_09_27_12_14.user_id));

-- 업적 정책
CREATE POLICY "Anyone can view achievements" ON public.achievements_2025_09_27_12_14 FOR SELECT USING (true);
CREATE POLICY "Users can view own achievements" ON public.user_achievements_2025_09_27_12_14 FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_profiles_2025_09_27_12_14 WHERE id = user_achievements_2025_09_27_12_14.user_id));

-- 참여도 로그 정책
CREATE POLICY "Users can view own participation logs" ON public.participation_logs_2025_09_27_12_14 FOR SELECT USING (auth.uid() IN (SELECT user_id FROM public.user_profiles_2025_09_27_12_14 WHERE id = participation_logs_2025_09_27_12_14.user_id));

-- 기본 업적 데이터 삽입
INSERT INTO public.achievements_2025_09_27_12_14 (name, description, icon, condition_type, condition_value, points) VALUES
('첫 투자', '첫 번째 투자 기록을 등록했습니다', '🎯', 'first_investment', 1, 100),
('수익 달성', '첫 번째 수익을 달성했습니다', '💰', 'first_profit', 1, 200),
('활발한 참여자', '10개의 투자 아이디어를 공유했습니다', '🔥', 'ideas_shared', 10, 500),
('댓글 마스터', '50개의 댓글을 작성했습니다', '💬', 'comments_written', 50, 300),
('수익률 10%', '10% 수익률을 달성했습니다', '📈', 'return_rate', 10, 1000);