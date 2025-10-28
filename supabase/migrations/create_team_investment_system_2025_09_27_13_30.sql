-- 팀 투자기록 및 종목 검색 시스템 확장

-- 종목 마스터 테이블 (검색용)
CREATE TABLE public.stock_master_2025_09_27_13_30 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  name_en VARCHAR(200),
  market VARCHAR(20) NOT NULL, -- 'KRX', 'NASDAQ', 'NYSE', 'AMEX'
  sector VARCHAR(100),
  industry VARCHAR(100),
  country VARCHAR(10) NOT NULL, -- 'KR', 'US'
  currency VARCHAR(10) NOT NULL, -- 'KRW', 'USD'
  stock_type VARCHAR(20) NOT NULL, -- 'stock', 'etf'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 팀 투자 포트폴리오 테이블
CREATE TABLE public.team_portfolios_2025_09_27_13_30 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.study_groups_2025_09_27_12_14(id) ON DELETE CASCADE,
  stock_symbol VARCHAR(20) NOT NULL,
  stock_name VARCHAR(200) NOT NULL,
  market VARCHAR(20) NOT NULL,
  country VARCHAR(10) NOT NULL,
  allocation_ratio DECIMAL(5,2) NOT NULL, -- 배분 비율 (%)
  target_return_rate DECIMAL(5,2), -- 목표 수익률 (%)
  current_return_rate DECIMAL(5,2) DEFAULT 0, -- 현재 수익률 (%)
  investment_reason TEXT, -- 투자 이유
  created_by UUID REFERENCES public.user_profiles_2025_09_27_12_14(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(group_id, stock_symbol)
);

-- 팀 투자 기록 테이블
CREATE TABLE public.team_investment_records_2025_09_27_13_30 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID REFERENCES public.study_groups_2025_09_27_12_14(id) ON DELETE CASCADE,
  stock_symbol VARCHAR(20) NOT NULL,
  stock_name VARCHAR(200) NOT NULL,
  market VARCHAR(20) NOT NULL,
  country VARCHAR(10) NOT NULL,
  transaction_type VARCHAR(10) NOT NULL CHECK (transaction_type IN ('buy', 'sell', 'rebalance')),
  allocation_change DECIMAL(5,2), -- 배분 비율 변경
  previous_allocation DECIMAL(5,2), -- 이전 배분 비율
  new_allocation DECIMAL(5,2), -- 새 배분 비율
  reason TEXT, -- 변경 이유
  created_by UUID REFERENCES public.user_profiles_2025_09_27_12_14(id),
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 개인 투자기록 테이블 확장 (기존 테이블에 컬럼 추가)
ALTER TABLE public.investment_records_2025_09_27_12_14 
ADD COLUMN market VARCHAR(20) DEFAULT 'KRX',
ADD COLUMN country VARCHAR(10) DEFAULT 'KR',
ADD COLUMN currency VARCHAR(10) DEFAULT 'KRW',
ADD COLUMN stock_type VARCHAR(20) DEFAULT 'stock';

-- 개인 포트폴리오 테이블 확장
ALTER TABLE public.portfolio_holdings_2025_09_27_12_14 
ADD COLUMN market VARCHAR(20) DEFAULT 'KRX',
ADD COLUMN country VARCHAR(10) DEFAULT 'KR',
ADD COLUMN currency VARCHAR(10) DEFAULT 'KRW',
ADD COLUMN stock_type VARCHAR(20) DEFAULT 'stock';

-- RLS 정책 설정
ALTER TABLE public.stock_master_2025_09_27_13_30 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_portfolios_2025_09_27_13_30 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_investment_records_2025_09_27_13_30 ENABLE ROW LEVEL SECURITY;

-- 종목 마스터 정책 (모든 사용자가 조회 가능)
CREATE POLICY "Anyone can view stock master" ON public.stock_master_2025_09_27_13_30 FOR SELECT USING (true);

-- 팀 포트폴리오 정책
CREATE POLICY "Group members can view team portfolio" ON public.team_portfolios_2025_09_27_13_30 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships_2025_09_27_12_14 gm
    JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
    WHERE up.user_id = auth.uid() AND gm.group_id = team_portfolios_2025_09_27_13_30.group_id
  )
);

CREATE POLICY "Group leaders can manage team portfolio" ON public.team_portfolios_2025_09_27_13_30 FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.study_groups_2025_09_27_12_14 sg
    JOIN public.user_profiles_2025_09_27_12_14 up ON sg.leader_id = up.id
    WHERE up.user_id = auth.uid() AND sg.id = team_portfolios_2025_09_27_13_30.group_id
  )
);

-- 팀 투자 기록 정책
CREATE POLICY "Group members can view team investment records" ON public.team_investment_records_2025_09_27_13_30 FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.group_memberships_2025_09_27_12_14 gm
    JOIN public.user_profiles_2025_09_27_12_14 up ON gm.user_id = up.id
    WHERE up.user_id = auth.uid() AND gm.group_id = team_investment_records_2025_09_27_13_30.group_id
  )
);

CREATE POLICY "Group leaders can manage team investment records" ON public.team_investment_records_2025_09_27_13_30 FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.study_groups_2025_09_27_12_14 sg
    JOIN public.user_profiles_2025_09_27_12_14 up ON sg.leader_id = up.id
    WHERE up.user_id = auth.uid() AND sg.id = team_investment_records_2025_09_27_13_30.group_id
  )
);

-- 종목 마스터 샘플 데이터 삽입
INSERT INTO public.stock_master_2025_09_27_13_30 (symbol, name, name_en, market, sector, industry, country, currency, stock_type) VALUES
-- 한국 주식
('005930', '삼성전자', 'Samsung Electronics Co Ltd', 'KRX', 'Technology', 'Semiconductors', 'KR', 'KRW', 'stock'),
('000660', 'SK하이닉스', 'SK Hynix Inc', 'KRX', 'Technology', 'Semiconductors', 'KR', 'KRW', 'stock'),
('035420', 'NAVER', 'NAVER Corp', 'KRX', 'Technology', 'Internet Services', 'KR', 'KRW', 'stock'),
('207940', '삼성바이오로직스', 'Samsung Biologics Co Ltd', 'KRX', 'Healthcare', 'Biotechnology', 'KR', 'KRW', 'stock'),
('068270', '셀트리온', 'Celltrion Inc', 'KRX', 'Healthcare', 'Biotechnology', 'KR', 'KRW', 'stock'),
('035720', '카카오', 'Kakao Corp', 'KRX', 'Technology', 'Internet Services', 'KR', 'KRW', 'stock'),
('251270', '넷마블', 'Netmarble Corp', 'KRX', 'Technology', 'Gaming', 'KR', 'KRW', 'stock'),
('036570', '엔씨소프트', 'NCSOFT Corp', 'KRX', 'Technology', 'Gaming', 'KR', 'KRW', 'stock'),
('105560', 'KB금융', 'KB Financial Group Inc', 'KRX', 'Financial', 'Banking', 'KR', 'KRW', 'stock'),
('055550', '신한지주', 'Shinhan Financial Group Co Ltd', 'KRX', 'Financial', 'Banking', 'KR', 'KRW', 'stock'),

-- 한국 ETF
('069500', 'KODEX 200', 'KODEX KOSPI 200', 'KRX', 'ETF', 'Broad Market', 'KR', 'KRW', 'etf'),
('114800', 'KODEX 인버스', 'KODEX KOSPI 200 Inverse', 'KRX', 'ETF', 'Inverse', 'KR', 'KRW', 'etf'),
('233740', 'KODEX 코스닥150', 'KODEX KOSDAQ 150', 'KRX', 'ETF', 'Growth', 'KR', 'KRW', 'etf'),
('148020', 'KBSTAR 200', 'KBSTAR KOSPI 200', 'KRX', 'ETF', 'Broad Market', 'KR', 'KRW', 'etf'),

-- 미국 주식
('AAPL', '애플', 'Apple Inc', 'NASDAQ', 'Technology', 'Consumer Electronics', 'US', 'USD', 'stock'),
('MSFT', '마이크로소프트', 'Microsoft Corp', 'NASDAQ', 'Technology', 'Software', 'US', 'USD', 'stock'),
('GOOGL', '구글', 'Alphabet Inc Class A', 'NASDAQ', 'Technology', 'Internet Services', 'US', 'USD', 'stock'),
('AMZN', '아마존', 'Amazon.com Inc', 'NASDAQ', 'Consumer Discretionary', 'E-commerce', 'US', 'USD', 'stock'),
('TSLA', '테슬라', 'Tesla Inc', 'NASDAQ', 'Consumer Discretionary', 'Electric Vehicles', 'US', 'USD', 'stock'),
('NVDA', '엔비디아', 'NVIDIA Corp', 'NASDAQ', 'Technology', 'Semiconductors', 'US', 'USD', 'stock'),
('META', '메타', 'Meta Platforms Inc', 'NASDAQ', 'Technology', 'Social Media', 'US', 'USD', 'stock'),
('NFLX', '넷플릭스', 'Netflix Inc', 'NASDAQ', 'Communication Services', 'Streaming', 'US', 'USD', 'stock'),
('JPM', 'JP모건', 'JPMorgan Chase & Co', 'NYSE', 'Financial', 'Banking', 'US', 'USD', 'stock'),
('JNJ', '존슨앤존슨', 'Johnson & Johnson', 'NYSE', 'Healthcare', 'Pharmaceuticals', 'US', 'USD', 'stock'),

-- 미국 ETF
('SPY', 'SPDR S&P 500', 'SPDR S&P 500 ETF Trust', 'NYSE', 'ETF', 'Broad Market', 'US', 'USD', 'etf'),
('QQQ', '나스닥 100', 'Invesco QQQ Trust', 'NASDAQ', 'ETF', 'Technology', 'US', 'USD', 'etf'),
('VTI', '전체 주식시장', 'Vanguard Total Stock Market ETF', 'NYSE', 'ETF', 'Broad Market', 'US', 'USD', 'etf'),
('VOO', 'S&P 500', 'Vanguard S&P 500 ETF', 'NYSE', 'ETF', 'Broad Market', 'US', 'USD', 'etf'),
('IWM', '러셀 2000', 'iShares Russell 2000 ETF', 'NYSE', 'ETF', 'Small Cap', 'US', 'USD', 'etf'),
('EFA', '선진국', 'iShares MSCI EAFE ETF', 'NYSE', 'ETF', 'International', 'US', 'USD', 'etf'),
('EEM', '신흥국', 'iShares MSCI Emerging Markets ETF', 'NYSE', 'ETF', 'Emerging Markets', 'US', 'USD', 'etf'),
('GLD', '금', 'SPDR Gold Shares', 'NYSE', 'ETF', 'Commodities', 'US', 'USD', 'etf');

-- 팀 포트폴리오 샘플 데이터
INSERT INTO public.team_portfolios_2025_09_27_13_30 (group_id, stock_symbol, stock_name, market, country, allocation_ratio, target_return_rate, current_return_rate, investment_reason, created_by) VALUES
-- 불패 A팀 (박주식 팀장)
((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀'), 
 '207940', '삼성바이오로직스', 'KRX', 'KR', 30.0, 25.0, 28.0, '글로벌 CMO 시장 성장과 4공장 완공 기대', 
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park')),

((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀'), 
 '068270', '셀트리온', 'KRX', 'KR', 25.0, 20.0, 17.0, '바이오시밀러 시장 확대 수혜', 
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park')),

((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀'), 
 'NVDA', '엔비디아', 'NASDAQ', 'US', 20.0, 30.0, 45.0, 'AI 반도체 시장 독점적 지위', 
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park')),

((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀'), 
 'QQQ', '나스닥 100', 'NASDAQ', 'US', 15.0, 15.0, 12.0, '미국 기술주 분산 투자', 
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park')),

((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀'), 
 '069500', 'KODEX 200', 'KRX', 'KR', 10.0, 8.0, 5.0, '국내 대형주 안정성 확보', 
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park')),

-- 불패 B팀 (김투자 팀장)
((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 B팀'), 
 'SPY', 'SPDR S&P 500', 'NYSE', 'US', 40.0, 12.0, 15.0, '미국 대형주 안정적 성장', 
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim')),

((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 B팀'), 
 '035420', 'NAVER', 'KRX', 'KR', 25.0, 18.0, 10.0, '플랫폼 사업 해외 진출 기대', 
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim')),

((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 B팀'), 
 '105560', 'KB금융', 'KRX', 'KR', 20.0, 10.0, 8.0, '금리 상승 수혜 및 안정적 배당', 
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim')),

((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 B팀'), 
 'VTI', '전체 주식시장', 'NYSE', 'US', 15.0, 10.0, 12.0, '미국 전체 시장 분산 투자', 
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim'));

-- 팀 투자 기록 샘플 데이터
INSERT INTO public.team_investment_records_2025_09_27_13_30 (group_id, stock_symbol, stock_name, market, country, transaction_type, allocation_change, previous_allocation, new_allocation, reason, created_by, transaction_date) VALUES
-- 불패 A팀 리밸런싱 기록
((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀'), 
 'NVDA', '엔비디아', 'NASDAQ', 'US', 'rebalance', 5.0, 15.0, 20.0, 'AI 시장 성장 가속화로 비중 확대', 
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park'), '2024-09-15'),

((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 A팀'), 
 '069500', 'KODEX 200', 'KRX', 'KR', 'rebalance', -5.0, 15.0, 10.0, '해외 투자 비중 확대를 위한 조정', 
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'stock_park'), '2024-09-15'),

-- 불패 B팀 리밸런싱 기록
((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 B팀'), 
 'SPY', 'SPDR S&P 500', 'NYSE', 'US', 'rebalance', 10.0, 30.0, 40.0, '미국 시장 강세로 비중 확대', 
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim'), '2024-09-10'),

((SELECT id FROM public.study_groups_2025_09_27_12_14 WHERE name = '불패 B팀'), 
 '035420', 'NAVER', 'KRX', 'KR', 'rebalance', -5.0, 30.0, 25.0, '해외 투자 비중 확대를 위한 조정', 
 (SELECT id FROM public.user_profiles_2025_09_27_12_14 WHERE username = 'investor_kim'), '2024-09-10');