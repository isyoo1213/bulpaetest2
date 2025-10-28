-- 기존 미국 ETF 데이터 삭제 후 확장된 데이터로 교체

-- 기존 미국 ETF 삭제
DELETE FROM public.stock_master_2025_09_27_13_30 WHERE country = 'US' AND stock_type = 'etf';

-- 확장된 미국 ETF 데이터 삽입
INSERT INTO public.stock_master_2025_09_27_13_30 (symbol, name, name_en, market, sector, industry, country, currency, stock_type) VALUES

-- 주요 지수 ETF
('SPY', 'SPDR S&P 500', 'SPDR S&P 500 ETF Trust', 'NYSE', 'ETF', 'Broad Market', 'US', 'USD', 'etf'),
('QQQ', '나스닥 100', 'Invesco QQQ Trust', 'NASDAQ', 'ETF', 'Technology', 'US', 'USD', 'etf'),
('VTI', '전체 주식시장', 'Vanguard Total Stock Market ETF', 'NYSE', 'ETF', 'Broad Market', 'US', 'USD', 'etf'),
('VOO', 'S&P 500', 'Vanguard S&P 500 ETF', 'NYSE', 'ETF', 'Broad Market', 'US', 'USD', 'etf'),
('IWM', '러셀 2000', 'iShares Russell 2000 ETF', 'NYSE', 'ETF', 'Small Cap', 'US', 'USD', 'etf'),
('DIA', '다우존스', 'SPDR Dow Jones Industrial Average ETF', 'NYSE', 'ETF', 'Blue Chip', 'US', 'USD', 'etf'),

-- 레버리지 ETF (3배)
('TQQQ', '나스닥 3배 레버리지', 'ProShares UltraPro QQQ', 'NASDAQ', 'ETF', 'Leveraged', 'US', 'USD', 'etf'),
('UPRO', 'S&P 500 3배 레버리지', 'ProShares UltraPro S&P 500', 'NYSE', 'ETF', 'Leveraged', 'US', 'USD', 'etf'),
('TNA', '러셀 2000 3배 레버리지', 'Direxion Daily Small Cap Bull 3X Shares', 'NYSE', 'ETF', 'Leveraged', 'US', 'USD', 'etf'),
('TECL', '기술주 3배 레버리지', 'Direxion Daily Technology Bull 3X Shares', 'NYSE', 'ETF', 'Leveraged', 'US', 'USD', 'etf'),
('SOXL', '반도체 3배 레버리지', 'Direxion Daily Semiconductor Bull 3X Shares', 'NYSE', 'ETF', 'Leveraged', 'US', 'USD', 'etf'),
('FNGU', 'FANG+ 3배 레버리지', 'MicroSectors FANG+ Index 3X Leveraged ETN', 'NYSE', 'ETF', 'Leveraged', 'US', 'USD', 'etf'),

-- 레버리지 ETF (2배)
('QLD', '나스닥 2배 레버리지', 'ProShares Ultra QQQ', 'NYSE', 'ETF', 'Leveraged', 'US', 'USD', 'etf'),
('SSO', 'S&P 500 2배 레버리지', 'ProShares Ultra S&P 500', 'NYSE', 'ETF', 'Leveraged', 'US', 'USD', 'etf'),
('UWM', '러셀 2000 2배 레버리지', 'ProShares Ultra Russell2000', 'NYSE', 'ETF', 'Leveraged', 'US', 'USD', 'etf'),

-- 인버스 ETF (하락 베팅)
('SQQQ', '나스닥 3배 인버스', 'ProShares UltraPro Short QQQ', 'NASDAQ', 'ETF', 'Inverse', 'US', 'USD', 'etf'),
('SPXS', 'S&P 500 3배 인버스', 'Direxion Daily S&P 500 Bear 3X Shares', 'NYSE', 'ETF', 'Inverse', 'US', 'USD', 'etf'),
('SOXS', '반도체 3배 인버스', 'Direxion Daily Semiconductor Bear 3X Shares', 'NYSE', 'ETF', 'Inverse', 'US', 'USD', 'etf'),
('PSQ', '나스닥 인버스', 'ProShares Short QQQ', 'NYSE', 'ETF', 'Inverse', 'US', 'USD', 'etf'),
('SH', 'S&P 500 인버스', 'ProShares Short S&P 500', 'NYSE', 'ETF', 'Inverse', 'US', 'USD', 'etf'),

-- 섹터 ETF
('XLK', '기술 섹터', 'Technology Select Sector SPDR Fund', 'NYSE', 'ETF', 'Technology', 'US', 'USD', 'etf'),
('XLF', '금융 섹터', 'Financial Select Sector SPDR Fund', 'NYSE', 'ETF', 'Financial', 'US', 'USD', 'etf'),
('XLV', '헬스케어 섹터', 'Health Care Select Sector SPDR Fund', 'NYSE', 'ETF', 'Healthcare', 'US', 'USD', 'etf'),
('XLE', '에너지 섹터', 'Energy Select Sector SPDR Fund', 'NYSE', 'ETF', 'Energy', 'US', 'USD', 'etf'),
('XLI', '산업 섹터', 'Industrial Select Sector SPDR Fund', 'NYSE', 'ETF', 'Industrial', 'US', 'USD', 'etf'),
('XLY', '소비재 섹터', 'Consumer Discretionary Select Sector SPDR Fund', 'NYSE', 'ETF', 'Consumer Discretionary', 'US', 'USD', 'etf'),
('XLP', '필수소비재 섹터', 'Consumer Staples Select Sector SPDR Fund', 'NYSE', 'ETF', 'Consumer Staples', 'US', 'USD', 'etf'),
('XLB', '소재 섹터', 'Materials Select Sector SPDR Fund', 'NYSE', 'ETF', 'Materials', 'US', 'USD', 'etf'),
('XLRE', '부동산 섹터', 'Real Estate Select Sector SPDR Fund', 'NYSE', 'ETF', 'Real Estate', 'US', 'USD', 'etf'),
('XLU', '유틸리티 섹터', 'Utilities Select Sector SPDR Fund', 'NYSE', 'ETF', 'Utilities', 'US', 'USD', 'etf'),

-- 테마/특수 ETF
('ARKK', 'ARK 혁신', 'ARK Innovation ETF', 'NYSE', 'ETF', 'Innovation', 'US', 'USD', 'etf'),
('ARKQ', 'ARK 자율주행', 'ARK Autonomous Technology & Robotics ETF', 'NYSE', 'ETF', 'Autonomous', 'US', 'USD', 'etf'),
('ARKW', 'ARK 인터넷', 'ARK Next Generation Internet ETF', 'NYSE', 'ETF', 'Internet', 'US', 'USD', 'etf'),
('ARKG', 'ARK 유전체', 'ARK Genomic Revolution ETF', 'NYSE', 'ETF', 'Genomics', 'US', 'USD', 'etf'),
('ARKF', 'ARK 핀테크', 'ARK Fintech Innovation ETF', 'NYSE', 'ETF', 'Fintech', 'US', 'USD', 'etf'),

-- 반도체 ETF
('SMH', '반도체', 'VanEck Semiconductor ETF', 'NASDAQ', 'ETF', 'Semiconductors', 'US', 'USD', 'etf'),
('SOXX', '반도체', 'iShares Semiconductor ETF', 'NASDAQ', 'ETF', 'Semiconductors', 'US', 'USD', 'etf'),

-- 클린에너지 ETF
('ICLN', '클린에너지', 'iShares Global Clean Energy ETF', 'NASDAQ', 'ETF', 'Clean Energy', 'US', 'USD', 'etf'),
('PBW', '클린에너지', 'Invesco WilderHill Clean Energy ETF', 'NYSE', 'ETF', 'Clean Energy', 'US', 'USD', 'etf'),
('QCLN', '클린에너지', 'First Trust NASDAQ Clean Edge Green Energy Index Fund', 'NASDAQ', 'ETF', 'Clean Energy', 'US', 'USD', 'etf'),

-- 바이오테크 ETF
('IBB', '바이오테크', 'iShares Biotechnology ETF', 'NASDAQ', 'ETF', 'Biotechnology', 'US', 'USD', 'etf'),
('XBI', '바이오테크', 'SPDR S&P Biotech ETF', 'NYSE', 'ETF', 'Biotechnology', 'US', 'USD', 'etf'),
('LABU', '바이오테크 3배 레버리지', 'Direxion Daily S&P Biotech Bull 3X Shares', 'NYSE', 'ETF', 'Leveraged', 'US', 'USD', 'etf'),

-- 사이버보안 ETF
('HACK', '사이버보안', 'ETFMG Prime Cyber Security ETF', 'NYSE', 'ETF', 'Cybersecurity', 'US', 'USD', 'etf'),
('CIBR', '사이버보안', 'First Trust NASDAQ Cybersecurity ETF', 'NASDAQ', 'ETF', 'Cybersecurity', 'US', 'USD', 'etf'),

-- 클라우드 컴퓨팅 ETF
('SKYY', '클라우드 컴퓨팅', 'First Trust Cloud Computing ETF', 'NASDAQ', 'ETF', 'Cloud Computing', 'US', 'USD', 'etf'),
('WCLD', '클라우드 컴퓨팅', 'WisdomTree Cloud Computing Fund', 'NASDAQ', 'ETF', 'Cloud Computing', 'US', 'USD', 'etf'),

-- 게임 ETF
('ESPO', '게임/e스포츠', 'VanEck Video Gaming and eSports ETF', 'NASDAQ', 'ETF', 'Gaming', 'US', 'USD', 'etf'),
('HERO', '게임/e스포츠', 'Global X Video Games & Esports ETF', 'NASDAQ', 'ETF', 'Gaming', 'US', 'USD', 'etf'),

-- 소셜미디어 ETF
('SOCL', '소셜미디어', 'Global X Social Media ETF', 'NASDAQ', 'ETF', 'Social Media', 'US', 'USD', 'etf'),

-- 로보틱스/AI ETF
('ROBO', '로보틱스/AI', 'ROBO Global Robotics and Automation Index ETF', 'NYSE', 'ETF', 'Robotics', 'US', 'USD', 'etf'),
('BOTZ', '로보틱스/AI', 'Global X Robotics & Artificial Intelligence ETF', 'NASDAQ', 'ETF', 'Robotics', 'US', 'USD', 'etf'),

-- 전기차 ETF
('LIT', '리튬/배터리', 'Global X Lithium & Battery Tech ETF', 'NYSE', 'ETF', 'Battery', 'US', 'USD', 'etf'),
('DRIV', '자율주행/전기차', 'Global X Autonomous & Electric Vehicles ETF', 'NASDAQ', 'ETF', 'Electric Vehicles', 'US', 'USD', 'etf'),

-- 우주항공 ETF
('UFO', '우주항공', 'Procure Space ETF', 'NYSE', 'ETF', 'Space', 'US', 'USD', 'etf'),

-- 국제 ETF
('EFA', '선진국', 'iShares MSCI EAFE ETF', 'NYSE', 'ETF', 'International', 'US', 'USD', 'etf'),
('EEM', '신흥국', 'iShares MSCI Emerging Markets ETF', 'NYSE', 'ETF', 'Emerging Markets', 'US', 'USD', 'etf'),
('VEA', '선진국', 'Vanguard FTSE Developed Markets ETF', 'NYSE', 'ETF', 'International', 'US', 'USD', 'etf'),
('VWO', '신흥국', 'Vanguard FTSE Emerging Markets ETF', 'NYSE', 'ETF', 'Emerging Markets', 'US', 'USD', 'etf'),
('FXI', '중국', 'iShares China Large-Cap ETF', 'NYSE', 'ETF', 'China', 'US', 'USD', 'etf'),
('EWJ', '일본', 'iShares MSCI Japan ETF', 'NYSE', 'ETF', 'Japan', 'US', 'USD', 'etf'),
('EWY', '한국', 'iShares MSCI South Korea ETF', 'NYSE', 'ETF', 'South Korea', 'US', 'USD', 'etf'),

-- 원자재 ETF
('GLD', '금', 'SPDR Gold Shares', 'NYSE', 'ETF', 'Commodities', 'US', 'USD', 'etf'),
('SLV', '은', 'iShares Silver Trust', 'NYSE', 'ETF', 'Commodities', 'US', 'USD', 'etf'),
('USO', '원유', 'United States Oil Fund', 'NYSE', 'ETF', 'Commodities', 'US', 'USD', 'etf'),
('UNG', '천연가스', 'United States Natural Gas Fund', 'NYSE', 'ETF', 'Commodities', 'US', 'USD', 'etf'),
('DBA', '농업', 'Invesco DB Agriculture Fund', 'NYSE', 'ETF', 'Commodities', 'US', 'USD', 'etf'),

-- 채권 ETF
('TLT', '장기국채', 'iShares 20+ Year Treasury Bond ETF', 'NASDAQ', 'ETF', 'Bonds', 'US', 'USD', 'etf'),
('IEF', '중기국채', 'iShares 7-10 Year Treasury Bond ETF', 'NASDAQ', 'ETF', 'Bonds', 'US', 'USD', 'etf'),
('SHY', '단기국채', 'iShares 1-3 Year Treasury Bond ETF', 'NASDAQ', 'ETF', 'Bonds', 'US', 'USD', 'etf'),
('HYG', '하이일드 채권', 'iShares iBoxx $ High Yield Corporate Bond ETF', 'NYSE', 'ETF', 'Bonds', 'US', 'USD', 'etf'),
('LQD', '투자등급 회사채', 'iShares iBoxx $ Investment Grade Corporate Bond ETF', 'NYSE', 'ETF', 'Bonds', 'US', 'USD', 'etf'),

-- 부동산 ETF
('VNQ', '부동산', 'Vanguard Real Estate ETF', 'NYSE', 'ETF', 'Real Estate', 'US', 'USD', 'etf'),
('IYR', '부동산', 'iShares U.S. Real Estate ETF', 'NYSE', 'ETF', 'Real Estate', 'US', 'USD', 'etf'),

-- 배당 ETF
('VYM', '고배당', 'Vanguard High Dividend Yield ETF', 'NYSE', 'ETF', 'Dividend', 'US', 'USD', 'etf'),
('SCHD', '고배당', 'Schwab US Dividend Equity ETF', 'NYSE', 'ETF', 'Dividend', 'US', 'USD', 'etf'),
('DVY', '고배당', 'iShares Select Dividend ETF', 'NASDAQ', 'ETF', 'Dividend', 'US', 'USD', 'etf'),

-- 성장주 ETF
('VUG', '대형 성장주', 'Vanguard Growth ETF', 'NYSE', 'ETF', 'Growth', 'US', 'USD', 'etf'),
('IWF', '대형 성장주', 'iShares Russell 1000 Growth ETF', 'NYSE', 'ETF', 'Growth', 'US', 'USD', 'etf'),
('VBK', '중형 성장주', 'Vanguard Small-Cap Growth ETF', 'NYSE', 'ETF', 'Growth', 'US', 'USD', 'etf'),

-- 가치주 ETF
('VTV', '대형 가치주', 'Vanguard Value ETF', 'NYSE', 'ETF', 'Value', 'US', 'USD', 'etf'),
('IWD', '대형 가치주', 'iShares Russell 1000 Value ETF', 'NYSE', 'ETF', 'Value', 'US', 'USD', 'etf'),
('VBR', '소형 가치주', 'Vanguard Small-Cap Value ETF', 'NYSE', 'ETF', 'Value', 'US', 'USD', 'etf'),

-- 변동성 ETF
('VIX', '변동성', 'iPath S&P 500 VIX Short-Term Futures ETN', 'NYSE', 'ETF', 'Volatility', 'US', 'USD', 'etf'),
('UVXY', '변동성 2배', 'ProShares Ultra VIX Short-Term Futures ETF', 'NYSE', 'ETF', 'Volatility', 'US', 'USD', 'etf'),
('SVXY', '변동성 인버스', 'ProShares Short VIX Short-Term Futures ETF', 'NYSE', 'ETF', 'Volatility', 'US', 'USD', 'etf');

-- 추가 한국 ETF도 보강
INSERT INTO public.stock_master_2025_09_27_13_30 (symbol, name, name_en, market, sector, industry, country, currency, stock_type) VALUES
-- 한국 추가 ETF
('102110', 'TIGER 200', 'TIGER KOSPI 200', 'KRX', 'ETF', 'Broad Market', 'KR', 'KRW', 'etf'),
('091160', 'KODEX 반도체', 'KODEX Semiconductor', 'KRX', 'ETF', 'Semiconductors', 'KR', 'KRW', 'etf'),
('091180', 'KODEX 자동차', 'KODEX Automobile', 'KRX', 'ETF', 'Automobile', 'KR', 'KRW', 'etf'),
('091170', 'KODEX 은행', 'KODEX Bank', 'KRX', 'ETF', 'Banking', 'KR', 'KRW', 'etf'),
('229200', 'KODEX 코스닥150 레버리지', 'KODEX KOSDAQ 150 Leverage', 'KRX', 'ETF', 'Leveraged', 'KR', 'KRW', 'etf'),
('233160', 'KODEX 200 레버리지', 'KODEX KOSPI 200 Leverage', 'KRX', 'ETF', 'Leveraged', 'KR', 'KRW', 'etf'),
('251340', 'KODEX 코스닥150 인버스', 'KODEX KOSDAQ 150 Inverse', 'KRX', 'ETF', 'Inverse', 'KR', 'KRW', 'etf'),
('278530', 'KODEX 200TR', 'KODEX KOSPI 200 TR', 'KRX', 'ETF', 'Broad Market', 'KR', 'KRW', 'etf'),
('143850', 'TIGER 미국S&P500', 'TIGER US S&P 500', 'KRX', 'ETF', 'US Market', 'KR', 'KRW', 'etf'),
('133690', 'TIGER 미국나스닥100', 'TIGER US NASDAQ 100', 'KRX', 'ETF', 'US Market', 'KR', 'KRW', 'etf');