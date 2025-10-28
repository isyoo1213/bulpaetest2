import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart,
  BarChart3,
  Globe,
  Building,
  Crown,
  Users,
  Target,
  Calendar,
  Percent,
  FileText
} from 'lucide-react';

interface Stock {
  id: string;
  symbol: string;
  name: string;
  name_en?: string;
  market: string;
  sector?: string;
  industry?: string;
  country: string;
  currency: string;
  stock_type: string;
}

interface TeamPortfolio {
  id: string;
  stock_symbol: string;
  stock_name: string;
  market: string;
  country: string;
  allocation_ratio: number;
  target_return_rate: number;
  current_return_rate: number;
  investment_reason: string;
}

interface InvestmentRecord {
  id: string;
  stock_symbol: string;
  stock_name: string;
  transaction_type: string;
  quantity: number;
  price: number;
  total_amount: number;
  transaction_date: string;
  market: string;
  country: string;
}

interface NewInvestmentProps {
  user: User;
}

export default function NewInvestment({ user }: NewInvestmentProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userGroup, setUserGroup] = useState<any>(null);
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [teamPortfolio, setTeamPortfolio] = useState<TeamPortfolio[]>([]);
  const [personalRecords, setPersonalRecords] = useState<InvestmentRecord[]>([]);
  const { toast } = useToast();

  // 개인 투자 기록 폼
  const [personalForm, setPersonalForm] = useState({
    transaction_type: '',
    quantity: 0,
    price: 0,
    transaction_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // 팀 포트폴리오 폼
  const [teamForm, setTeamForm] = useState({
    allocation_ratio: 0,
    target_return_rate: 0,
    current_return_rate: 0,
    investment_reason: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);

      // 사용자 프로필 조회
      const { data: profile } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setUserProfile(profile);

        // 사용자 그룹 조회
        const { data: membership } = await supabase
          .from('group_memberships_2025_09_27_12_14')
          .select(`
            group_id,
            study_groups_2025_09_27_12_14 (*)
          `)
          .eq('user_id', profile.id)
          .single();

        if (membership) {
          setUserGroup(membership.study_groups_2025_09_27_12_14);
          
          // 팀장 여부 확인
          const isLeader = membership.study_groups_2025_09_27_12_14.leader_id === profile.id;
          setIsTeamLeader(isLeader);

          if (isLeader) {
            fetchTeamPortfolio(membership.study_groups_2025_09_27_12_14.id);
          } else {
            fetchPersonalRecords(profile.id);
          }
        }
      }

    } catch (error) {
      console.error('초기 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamPortfolio = async (groupId: string) => {
    try {
      const { data } = await supabase
        .from('team_portfolios_2025_09_27_13_30')
        .select('*')
        .eq('group_id', groupId)
        .order('allocation_ratio', { ascending: false });

      setTeamPortfolio(data || []);
    } catch (error) {
      console.error('팀 포트폴리오 조회 오류:', error);
    }
  };

  const fetchPersonalRecords = async (userId: string) => {
    try {
      const { data } = await supabase
        .from('investment_records_2025_09_27_12_14')
        .select('*')
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })
        .limit(10);

      setPersonalRecords(data || []);
    } catch (error) {
      console.error('개인 투자 기록 조회 오류:', error);
    }
  };

  const searchStocks = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const { data } = await supabase
        .from('stock_master_2025_09_27_13_30')
        .select('*')
        .or(`name.ilike.%${query}%, symbol.ilike.%${query}%, name_en.ilike.%${query}%`)
        .eq('is_active', true)
        .order('country')
        .order('stock_type')
        .limit(20);

      setSearchResults(data || []);
    } catch (error) {
      console.error('종목 검색 오류:', error);
    }
  };

  const handleStockSelect = (stock: Stock) => {
    setSelectedStock(stock);
    setSearchQuery(`${stock.symbol} - ${stock.name}`);
    setSearchResults([]);
  };

  const handlePersonalInvestment = async () => {
    if (!selectedStock || !personalForm.transaction_type || personalForm.quantity <= 0 || personalForm.price <= 0) {
      toast({
        title: "입력 오류",
        description: "모든 필수 항목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const totalAmount = personalForm.quantity * personalForm.price;

      const { error } = await supabase
        .from('investment_records_2025_09_27_12_14')
        .insert({
          user_id: userProfile.id,
          stock_symbol: selectedStock.symbol,
          stock_name: selectedStock.name,
          transaction_type: personalForm.transaction_type,
          quantity: personalForm.quantity,
          price: personalForm.price,
          total_amount: totalAmount,
          transaction_date: personalForm.transaction_date,
          market: selectedStock.market,
          country: selectedStock.country,
          currency: selectedStock.currency,
          stock_type: selectedStock.stock_type,
          notes: personalForm.notes
        });

      if (error) throw error;

      toast({
        title: "투자 기록 추가 완료",
        description: `${selectedStock.name} ${personalForm.transaction_type === 'buy' ? '매수' : '매도'} 기록이 추가되었습니다.`,
      });

      // 폼 초기화
      setPersonalForm({
        transaction_type: '',
        quantity: 0,
        price: 0,
        transaction_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setSelectedStock(null);
      setSearchQuery('');

      // 데이터 새로고침
      fetchPersonalRecords(userProfile.id);

    } catch (error: any) {
      toast({
        title: "투자 기록 추가 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTeamPortfolioUpdate = async () => {
    if (!selectedStock || teamForm.allocation_ratio <= 0) {
      toast({
        title: "입력 오류",
        description: "종목과 배분 비율을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from('team_portfolios_2025_09_27_13_30')
        .upsert({
          group_id: userGroup.id,
          stock_symbol: selectedStock.symbol,
          stock_name: selectedStock.name,
          market: selectedStock.market,
          country: selectedStock.country,
          allocation_ratio: teamForm.allocation_ratio,
          target_return_rate: teamForm.target_return_rate,
          current_return_rate: teamForm.current_return_rate,
          investment_reason: teamForm.investment_reason,
          created_by: userProfile.id
        });

      if (error) throw error;

      toast({
        title: "팀 포트폴리오 업데이트 완료",
        description: `${selectedStock.name} 포트폴리오가 업데이트되었습니다.`,
      });

      // 폼 초기화
      setTeamForm({
        allocation_ratio: 0,
        target_return_rate: 0,
        current_return_rate: 0,
        investment_reason: ''
      });
      setSelectedStock(null);
      setSearchQuery('');

      // 데이터 새로고침
      fetchTeamPortfolio(userGroup.id);

    } catch (error: any) {
      toast({
        title: "팀 포트폴리오 업데이트 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMarketIcon = (market: string, country: string) => {
    if (country === 'US') {
      return <Globe className="h-4 w-4 text-blue-600" />;
    }
    return <Building className="h-4 w-4 text-green-600" />;
  };

  const getStockTypeIcon = (stockType: string) => {
    return stockType === 'etf' ? <PieChart className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'USD') {
      return `$${amount.toLocaleString()}`;
    }
    return `₩${amount.toLocaleString()}`;
  };

  if (loading && !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">투자 시스템을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">투자 기록</h1>
          <div className="flex items-center justify-center space-x-2">
            {isTeamLeader ? (
              <div className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <span className="text-lg font-semibold text-yellow-700">팀장 - 팀 포트폴리오 관리</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-lg font-semibold text-blue-700">팀원 - 개인 투자 기록</span>
              </div>
            )}
          </div>
        </div>

        {/* 종목 검색 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-blue-600" />
              <span>종목 검색</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Input
                placeholder="종목명 또는 심볼을 입력하세요 (예: 삼성전자, 005930, AAPL, Apple)"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchStocks(e.target.value);
                }}
                className="pr-10"
              />
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((stock) => (
                    <div
                      key={stock.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleStockSelect(stock)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getMarketIcon(stock.market, stock.country)}
                          {getStockTypeIcon(stock.stock_type)}
                          <div>
                            <div className="font-semibold">{stock.symbol} - {stock.name}</div>
                            {stock.name_en && (
                              <div className="text-sm text-gray-500">{stock.name_en}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline" className="mb-1">
                            {stock.market}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            {stock.stock_type === 'etf' ? 'ETF' : '주식'} • {stock.country === 'US' ? '미국' : '한국'}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {selectedStock && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getMarketIcon(selectedStock.market, selectedStock.country)}
                  {getStockTypeIcon(selectedStock.stock_type)}
                  <div>
                    <h4 className="font-semibold">{selectedStock.symbol} - {selectedStock.name}</h4>
                    <p className="text-sm text-gray-600">
                      {selectedStock.market} • {selectedStock.stock_type === 'etf' ? 'ETF' : '주식'} • 
                      {selectedStock.country === 'US' ? ' 미국' : ' 한국'} • {selectedStock.currency}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs defaultValue={isTeamLeader ? "team" : "personal"} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team" disabled={!isTeamLeader}>
              팀 포트폴리오 {isTeamLeader && <Crown className="h-4 w-4 ml-1" />}
            </TabsTrigger>
            <TabsTrigger value="personal">개인 투자 기록</TabsTrigger>
          </TabsList>

          {/* 팀 포트폴리오 관리 (팀장만) */}
          {isTeamLeader && (
            <TabsContent value="team" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    <span>팀 포트폴리오 추가/수정</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedStock && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="allocation_ratio">배분 비율 (%)</Label>
                          <Input
                            id="allocation_ratio"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            placeholder="예: 25.5"
                            value={teamForm.allocation_ratio || ''}
                            onChange={(e) => setTeamForm({...teamForm, allocation_ratio: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="target_return_rate">목표 수익률 (%)</Label>
                          <Input
                            id="target_return_rate"
                            type="number"
                            step="0.1"
                            placeholder="예: 15.0"
                            value={teamForm.target_return_rate || ''}
                            onChange={(e) => setTeamForm({...teamForm, target_return_rate: parseFloat(e.target.value) || 0})}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="current_return_rate">현재 수익률 (%)</Label>
                        <Input
                          id="current_return_rate"
                          type="number"
                          step="0.1"
                          placeholder="예: 12.5"
                          value={teamForm.current_return_rate || ''}
                          onChange={(e) => setTeamForm({...teamForm, current_return_rate: parseFloat(e.target.value) || 0})}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="investment_reason">투자 이유</Label>
                        <Textarea
                          id="investment_reason"
                          placeholder="이 종목을 선택한 이유와 투자 전략을 설명해주세요"
                          value={teamForm.investment_reason}
                          onChange={(e) => setTeamForm({...teamForm, investment_reason: e.target.value})}
                          rows={3}
                        />
                      </div>

                      <Button 
                        onClick={handleTeamPortfolioUpdate} 
                        disabled={loading || !selectedStock || teamForm.allocation_ratio <= 0}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <PieChart className="h-4 w-4 mr-2" />
                        팀 포트폴리오 업데이트
                      </Button>
                    </>
                  )}

                  {!selectedStock && (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">먼저 종목을 검색하고 선택해주세요.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 현재 팀 포트폴리오 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="h-5 w-5 text-green-600" />
                      <span>현재 팀 포트폴리오</span>
                    </div>
                    <Badge variant="outline">
                      총 {teamPortfolio.reduce((sum, item) => sum + item.allocation_ratio, 0).toFixed(1)}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teamPortfolio.length > 0 ? (
                    <div className="space-y-4">
                      {teamPortfolio.map((item) => (
                        <div key={item.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              {getMarketIcon(item.market, item.country)}
                              <div>
                                <h4 className="font-semibold">{item.stock_symbol} - {item.stock_name}</h4>
                                <p className="text-sm text-gray-600">{item.market} • {item.country === 'US' ? '미국' : '한국'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-blue-600">{item.allocation_ratio}%</div>
                              <div className="text-sm text-gray-500">배분 비율</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div className="text-center p-2 bg-green-50 rounded">
                              <div className="text-sm text-gray-600">목표 수익률</div>
                              <div className="font-semibold text-green-600">+{item.target_return_rate}%</div>
                            </div>
                            <div className="text-center p-2 bg-blue-50 rounded">
                              <div className="text-sm text-gray-600">현재 수익률</div>
                              <div className={`font-semibold ${item.current_return_rate >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                {item.current_return_rate >= 0 ? '+' : ''}{item.current_return_rate}%
                              </div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="text-sm text-gray-600 mb-1">목표 달성률</div>
                            <Progress 
                              value={Math.min((item.current_return_rate / item.target_return_rate) * 100, 100)} 
                              className="h-2" 
                            />
                          </div>

                          {item.investment_reason && (
                            <div className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              <strong>투자 이유:</strong> {item.investment_reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">아직 팀 포트폴리오가 없습니다.</p>
                      <p className="text-sm text-gray-500">종목을 검색하고 포트폴리오를 구성해보세요.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* 개인 투자 기록 */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-green-600" />
                  <span>개인 투자 기록 추가</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedStock && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="transaction_type">거래 유형</Label>
                        <Select 
                          value={personalForm.transaction_type} 
                          onValueChange={(value) => setPersonalForm({...personalForm, transaction_type: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="거래 유형 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="buy">매수</SelectItem>
                            <SelectItem value="sell">매도</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="transaction_date">거래 날짜</Label>
                        <Input
                          id="transaction_date"
                          type="date"
                          value={personalForm.transaction_date}
                          onChange={(e) => setPersonalForm({...personalForm, transaction_date: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">수량</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          step="1"
                          placeholder="예: 10"
                          value={personalForm.quantity || ''}
                          onChange={(e) => setPersonalForm({...personalForm, quantity: parseInt(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">단가 ({selectedStock.currency})</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder={selectedStock.currency === 'USD' ? "예: 150.50" : "예: 75000"}
                          value={personalForm.price || ''}
                          onChange={(e) => setPersonalForm({...personalForm, price: parseFloat(e.target.value) || 0})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>총 금액</Label>
                        <div className="p-2 bg-gray-50 rounded border text-center font-semibold">
                          {formatCurrency(personalForm.quantity * personalForm.price, selectedStock.currency)}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">메모 (선택)</Label>
                      <Textarea
                        id="notes"
                        placeholder="투자 이유나 기타 메모를 입력하세요"
                        value={personalForm.notes}
                        onChange={(e) => setPersonalForm({...personalForm, notes: e.target.value})}
                        rows={2}
                      />
                    </div>

                    <Button 
                      onClick={handlePersonalInvestment} 
                      disabled={loading || !selectedStock || !personalForm.transaction_type || personalForm.quantity <= 0 || personalForm.price <= 0}
                      className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      투자 기록 추가
                    </Button>
                  </>
                )}

                {!selectedStock && (
                  <div className="text-center py-8">
                    <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">먼저 종목을 검색하고 선택해주세요.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 최근 개인 투자 기록 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <span>최근 투자 기록</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {personalRecords.length > 0 ? (
                  <div className="space-y-3">
                    {personalRecords.map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            {getMarketIcon(record.market, record.country)}
                            <div>
                              <h4 className="font-semibold">{record.stock_symbol} - {record.stock_name}</h4>
                              <p className="text-sm text-gray-600">{record.market} • {record.country === 'US' ? '미국' : '한국'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge className={record.transaction_type === 'buy' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}>
                              {record.transaction_type === 'buy' ? '매수' : '매도'}
                            </Badge>
                            <div className="text-sm text-gray-500 mt-1">
                              {new Date(record.transaction_date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">수량:</span> {record.quantity.toLocaleString()}주
                          </div>
                          <div>
                            <span className="text-gray-600">단가:</span> {formatCurrency(record.price, record.country === 'US' ? 'USD' : 'KRW')}
                          </div>
                          <div>
                            <span className="text-gray-600">총액:</span> {formatCurrency(record.total_amount, record.country === 'US' ? 'USD' : 'KRW')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">아직 투자 기록이 없습니다.</p>
                    <p className="text-sm text-gray-500">첫 번째 투자 기록을 추가해보세요.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}