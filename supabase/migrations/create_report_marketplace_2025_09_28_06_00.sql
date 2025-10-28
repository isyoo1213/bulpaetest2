-- 레포트 판매 및 구매 시스템

-- 레포트 카테고리 테이블
CREATE TABLE public.report_categories_2025_09_28_06_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 레포트 테이블
CREATE TABLE public.reports_2025_09_28_06_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  content TEXT, -- 레포트 내용 (미리보기용)
  category_id UUID REFERENCES public.report_categories_2025_09_28_06_00(id),
  author_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL DEFAULT 0, -- 가격 (0이면 무료)
  file_url TEXT, -- PDF 파일 URL
  file_size INTEGER, -- 파일 크기 (bytes)
  page_count INTEGER, -- 페이지 수
  preview_image_url TEXT, -- 미리보기 이미지
  tags TEXT[], -- 태그 배열
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'suspended')),
  view_count INTEGER DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2) DEFAULT 0,
  rating_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 레포트 구매 기록 테이블
CREATE TABLE public.report_purchases_2025_09_28_06_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports_2025_09_28_06_00(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  purchase_price DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50), -- 'points', 'card', 'bank_transfer' 등
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  transaction_id VARCHAR(100), -- 결제 트랜잭션 ID
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  downloaded_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  
  UNIQUE(report_id, buyer_id) -- 같은 레포트를 중복 구매 방지
);

-- 레포트 리뷰 테이블
CREATE TABLE public.report_reviews_2025_09_28_06_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID REFERENCES public.reports_2025_09_28_06_00(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES public.report_purchases_2025_09_28_06_00(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(report_id, reviewer_id) -- 같은 레포트에 대해 한 번만 리뷰 가능
);

-- 사용자 포인트 테이블
CREATE TABLE public.user_points_2025_09_28_06_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE UNIQUE,
  current_points INTEGER DEFAULT 0,
  total_earned INTEGER DEFAULT 0,
  total_spent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 포인트 거래 기록 테이블
CREATE TABLE public.point_transactions_2025_09_28_06_00 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles_2025_09_27_12_14(id) ON DELETE CASCADE,
  transaction_type VARCHAR(20) NOT NULL CHECK (transaction_type IN ('earn', 'spend', 'refund')),
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  reference_type VARCHAR(50), -- 'report_purchase', 'report_sale', 'participation_reward' 등
  reference_id UUID, -- 관련 레코드 ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE public.report_categories_2025_09_28_06_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_2025_09_28_06_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_purchases_2025_09_28_06_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_reviews_2025_09_28_06_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_points_2025_09_28_06_00 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions_2025_09_28_06_00 ENABLE ROW LEVEL SECURITY;

-- 카테고리 정책 (모든 사용자가 조회 가능)
CREATE POLICY "Anyone can view categories" ON public.report_categories_2025_09_28_06_00 FOR SELECT USING (true);

-- 레포트 정책
CREATE POLICY "Anyone can view published reports" ON public.reports_2025_09_28_06_00 FOR SELECT USING (status = 'published');
CREATE POLICY "Authors can manage their reports" ON public.reports_2025_09_28_06_00 FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles_2025_09_27_12_14 up
    WHERE up.user_id = auth.uid() AND up.id = reports_2025_09_28_06_00.author_id
  )
);

-- 구매 기록 정책
CREATE POLICY "Users can view their purchases" ON public.report_purchases_2025_09_28_06_00 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles_2025_09_27_12_14 up
    WHERE up.user_id = auth.uid() AND up.id = report_purchases_2025_09_28_06_00.buyer_id
  )
);
CREATE POLICY "Users can create purchases" ON public.report_purchases_2025_09_28_06_00 FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles_2025_09_27_12_14 up
    WHERE up.user_id = auth.uid() AND up.id = report_purchases_2025_09_28_06_00.buyer_id
  )
);

-- 리뷰 정책
CREATE POLICY "Anyone can view reviews" ON public.report_reviews_2025_09_28_06_00 FOR SELECT USING (true);
CREATE POLICY "Buyers can create reviews" ON public.report_reviews_2025_09_28_06_00 FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles_2025_09_27_12_14 up
    WHERE up.user_id = auth.uid() AND up.id = report_reviews_2025_09_28_06_00.reviewer_id
  )
);

-- 포인트 정책
CREATE POLICY "Users can view their points" ON public.user_points_2025_09_28_06_00 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles_2025_09_27_12_14 up
    WHERE up.user_id = auth.uid() AND up.id = user_points_2025_09_28_06_00.user_id
  )
);

-- 포인트 거래 기록 정책
CREATE POLICY "Users can view their transactions" ON public.point_transactions_2025_09_28_06_00 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles_2025_09_27_12_14 up
    WHERE up.user_id = auth.uid() AND up.id = point_transactions_2025_09_28_06_00.user_id
  )
);

-- 인덱스 생성
CREATE INDEX idx_reports_author ON public.reports_2025_09_28_06_00(author_id);
CREATE INDEX idx_reports_category ON public.reports_2025_09_28_06_00(category_id);
CREATE INDEX idx_reports_status ON public.reports_2025_09_28_06_00(status);
CREATE INDEX idx_purchases_buyer ON public.report_purchases_2025_09_28_06_00(buyer_id);
CREATE INDEX idx_purchases_report ON public.report_purchases_2025_09_28_06_00(report_id);
CREATE INDEX idx_reviews_report ON public.report_reviews_2025_09_28_06_00(report_id);
CREATE INDEX idx_point_transactions_user ON public.point_transactions_2025_09_28_06_00(user_id);

-- 샘플 데이터 삽입

-- 카테고리 데이터
INSERT INTO public.report_categories_2025_09_28_06_00 (name, description, icon) VALUES
('주식 분석', '개별 종목에 대한 심층 분석 레포트', 'TrendingUp'),
('시장 전망', '시장 동향 및 전망 분석', 'BarChart3'),
('섹터 분석', '특정 섹터에 대한 종합 분석', 'PieChart'),
('투자 전략', '투자 방법론 및 전략 가이드', 'Target'),
('경제 분석', '거시경제 및 정책 분석', 'Globe'),
('기술적 분석', '차트 및 기술적 분석 방법', 'Activity');

-- 모든 사용자에게 초기 포인트 지급
INSERT INTO public.user_points_2025_09_28_06_00 (user_id, current_points, total_earned)
SELECT id, 10000, 10000 FROM public.user_profiles_2025_09_27_12_14;

-- 초기 포인트 지급 거래 기록
INSERT INTO public.point_transactions_2025_09_28_06_00 (user_id, transaction_type, amount, description, reference_type)
SELECT id, 'earn', 10000, '신규 가입 축하 포인트', 'welcome_bonus' FROM public.user_profiles_2025_09_27_12_14;

-- 샘플 레포트 데이터
INSERT INTO public.reports_2025_09_28_06_00 (title, description, content, category_id, author_id, price, page_count, tags, status, view_count, download_count, rating_average, rating_count) VALUES
-- 박주식의 레포트
('삼성바이오로직스 4공장 완공 임팩트 분석', 
 '삼성바이오로직스의 4공장 완공이 실적에 미치는 영향을 상세히 분석한 레포트입니다. CMO 시장 성장성과 함께 향후 주가 전망을 제시합니다.',
 '# 삼성바이오로직스 4공장 완공 임팩트 분석\n\n## 1. 개요\n삼성바이오로직스는 2024년 하반기 4공장 완공을 앞두고 있으며, 이는 회사의 생산능력을 크게 확대할 것으로 예상됩니다.\n\n## 2. 주요 분석 포인트\n- 4공장 완공으로 인한 생산능력 증대\n- CMO 시장에서의 경쟁력 강화\n- 향후 3년간 실적 전망\n\n## 3. 투자 의견\n목표주가: 950,000원 (상향 조정)\n투자의견: BUY',
 (SELECT id FROM public.report_categories_2025_09_28_06_00 WHERE name = '주식 분석'),
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park'),
 5000, 15, ARRAY['삼성바이오로직스', '바이오', 'CMO', '4공장'], 'published', 45, 12, 4.5, 8),

('2024년 하반기 바이오 섹터 전망', 
 '국내외 바이오 기업들의 실적 전망과 투자 포인트를 정리한 섹터 분석 레포트입니다.',
 '# 2024년 하반기 바이오 섹터 전망\n\n## 주요 기업 분석\n- 삼성바이오로직스: 4공장 완공 효과\n- 셀트리온: 바이오시밀러 시장 확대\n- SK바이오팜: 신약 파이프라인 진행 상황',
 (SELECT id FROM public.report_categories_2025_09_28_06_00 WHERE name = '섹터 분석'),
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park'),
 8000, 25, ARRAY['바이오', '섹터분석', '하반기전망'], 'published', 32, 8, 4.2, 5),

-- 김투자의 레포트
('미국 금리 인하 사이클과 한국 증시 영향 분석', 
 '미국 연준의 금리 인하가 한국 증시에 미치는 영향을 분석하고, 수혜 섹터를 제시합니다.',
 '# 미국 금리 인하 사이클과 한국 증시 영향 분석\n\n## 1. 금리 인하 배경\n- 인플레이션 둔화\n- 경기 침체 우려\n\n## 2. 한국 증시 영향\n- 외국인 자금 유입 기대\n- 성장주 선호 현상\n\n## 3. 수혜 섹터\n- 기술주 (네이버, 카카오)\n- 금융주 (은행, 증권)\n- 부동산 관련주',
 (SELECT id FROM public.report_categories_2025_09_28_06_00 WHERE name = '시장 전망'),
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim'),
 6000, 20, ARRAY['금리인하', '미국', '한국증시', '거시경제'], 'published', 67, 18, 4.7, 12),

('ETF 포트폴리오 구성 전략 가이드', 
 'ETF를 활용한 효율적인 포트폴리오 구성 방법과 리밸런싱 전략을 상세히 설명합니다.',
 '# ETF 포트폴리오 구성 전략 가이드\n\n## 1. ETF 선택 기준\n- 운용보수 비교\n- 추적 오차 분석\n- 거래량 및 유동성\n\n## 2. 포트폴리오 구성\n- 코어-새틀라이트 전략\n- 지역별 분산\n- 섹터별 분산\n\n## 3. 리밸런싱\n- 주기적 리밸런싱\n- 임계치 기반 리밸런싱',
 (SELECT id FROM public.report_categories_2025_09_28_06_00 WHERE name = '투자 전략'),
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim'),
 4000, 18, ARRAY['ETF', '포트폴리오', '리밸런싱', '분산투자'], 'published', 89, 25, 4.8, 15),

-- 정성장의 레포트
('게임주 반등 시나리오와 투자 전략', 
 '모바일 게임 시장 회복 전망과 주요 게임주들의 투자 포인트를 분석합니다.',
 '# 게임주 반등 시나리오와 투자 전략\n\n## 1. 게임 시장 현황\n- 모바일 게임 시장 성장 둔화\n- 신작 게임 출시 일정\n\n## 2. 주요 기업 분석\n- 넷마블: 신작 게임 기대감\n- 엔씨소프트: 리니지 시리즈 성과\n- 크래프톤: 배틀그라운드 모바일\n\n## 3. 투자 전략\n- 선별적 접근 필요\n- 신작 게임 출시 타이밍 주목',
 (SELECT id FROM public.report_categories_2025_09_28_06_00 WHERE name = '섹터 분석'),
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'growth_jung'),
 3500, 12, ARRAY['게임주', '넷마블', '엔씨소프트', '모바일게임'], 'published', 28, 7, 3.9, 4),

-- 무료 레포트
('주식 투자 기초 가이드', 
 '주식 투자를 시작하는 초보자를 위한 기본 개념과 용어 설명서입니다.',
 '# 주식 투자 기초 가이드\n\n## 1. 주식이란?\n- 주식의 정의\n- 주주의 권리\n\n## 2. 투자 기본 원칙\n- 분산 투자\n- 장기 투자\n- 리스크 관리\n\n## 3. 기본 용어\n- PER, PBR\n- ROE, ROA\n- 시가총액',
 (SELECT id FROM public.report_categories_2025_09_28_06_00 WHERE name = '투자 전략'),
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim'),
 0, 10, ARRAY['기초', '초보자', '투자원칙'], 'published', 156, 89, 4.3, 23);

-- 샘플 구매 기록
INSERT INTO public.report_purchases_2025_09_28_06_00 (report_id, buyer_id, purchase_price, payment_method, payment_status, purchased_at, downloaded_at, download_count) VALUES
-- 정성장이 박주식의 레포트 구매
((SELECT id FROM public.reports_2025_09_28_06_00 WHERE title LIKE '삼성바이오로직스%'),
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'growth_jung'),
 5000, 'points', 'completed', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 2),

-- 이트레이더가 김투자의 레포트 구매
((SELECT id FROM public.reports_2025_09_28_06_00 WHERE title LIKE 'ETF 포트폴리오%'),
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'trader_lee'),
 4000, 'points', 'completed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', 1),

-- 최가치가 김투자의 레포트 구매
((SELECT id FROM public.reports_2025_09_28_06_00 WHERE title LIKE '미국 금리%'),
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'value_choi'),
 6000, 'points', 'completed', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 3);

-- 샘플 리뷰
INSERT INTO public.report_reviews_2025_09_28_06_00 (report_id, reviewer_id, purchase_id, rating, review_text) VALUES
-- 정성장의 리뷰
((SELECT id FROM public.reports_2025_09_28_06_00 WHERE title LIKE '삼성바이오로직스%'),
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'growth_jung'),
 (SELECT id FROM public.report_purchases_2025_09_28_06_00 WHERE buyer_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'growth_jung') LIMIT 1),
 5, '4공장 완공 임팩트에 대한 분석이 매우 상세하고 실용적입니다. 투자 결정에 큰 도움이 되었어요!'),

-- 이트레이더의 리뷰
((SELECT id FROM public.reports_2025_09_28_06_00 WHERE title LIKE 'ETF 포트폴리오%'),
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'trader_lee'),
 (SELECT id FROM public.report_purchases_2025_09_28_06_00 WHERE buyer_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'trader_lee') LIMIT 1),
 4, 'ETF 선택 기준과 리밸런싱 전략이 체계적으로 잘 정리되어 있습니다. 실전에 바로 적용할 수 있어요.');

-- 구매에 따른 포인트 차감 기록
INSERT INTO public.point_transactions_2025_09_28_06_00 (user_id, transaction_type, amount, description, reference_type, reference_id) VALUES
-- 정성장 포인트 차감
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'growth_jung'),
 'spend', -5000, '삼성바이오로직스 4공장 완공 임팩트 분석 레포트 구매', 'report_purchase',
 (SELECT id FROM public.report_purchases_2025_09_28_06_00 WHERE buyer_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'growth_jung') LIMIT 1)),

-- 이트레이더 포인트 차감
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'trader_lee'),
 'spend', -4000, 'ETF 포트폴리오 구성 전략 가이드 레포트 구매', 'report_purchase',
 (SELECT id FROM public.report_purchases_2025_09_28_06_00 WHERE buyer_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'trader_lee') LIMIT 1)),

-- 최가치 포인트 차감
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'value_choi'),
 'spend', -6000, '미국 금리 인하 사이클과 한국 증시 영향 분석 레포트 구매', 'report_purchase',
 (SELECT id FROM public.report_purchases_2025_09_28_06_00 WHERE buyer_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'value_choi') LIMIT 1));

-- 판매에 따른 포인트 적립 기록 (판매자에게 90% 지급, 10%는 수수료)
INSERT INTO public.point_transactions_2025_09_28_06_00 (user_id, transaction_type, amount, description, reference_type) VALUES
-- 박주식 포인트 적립
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park'),
 'earn', 4500, '삼성바이오로직스 4공장 완공 임팩트 분석 레포트 판매 수익', 'report_sale'),

-- 김투자 포인트 적립
((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim'),
 'earn', 3600, 'ETF 포트폴리오 구성 전략 가이드 레포트 판매 수익', 'report_sale'),

((SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim'),
 'earn', 5400, '미국 금리 인하 사이클과 한국 증시 영향 분석 레포트 판매 수익', 'report_sale');

-- 포인트 잔액 업데이트
UPDATE public.user_points_2025_09_28_06_00 SET 
  current_points = current_points - 5000,
  total_spent = total_spent + 5000
WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'growth_jung');

UPDATE public.user_points_2025_09_28_06_00 SET 
  current_points = current_points - 4000,
  total_spent = total_spent + 4000
WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'trader_lee');

UPDATE public.user_points_2025_09_28_06_00 SET 
  current_points = current_points - 6000,
  total_spent = total_spent + 6000
WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'value_choi');

UPDATE public.user_points_2025_09_28_06_00 SET 
  current_points = current_points + 4500,
  total_earned = total_earned + 4500
WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park');

UPDATE public.user_points_2025_09_28_06_00 SET 
  current_points = current_points + 9000,
  total_earned = total_earned + 9000
WHERE user_id = (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim');