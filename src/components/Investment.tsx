import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, TrendingUp, TrendingDown, Calendar, DollarSign } from 'lucide-react';

interface InvestmentRecord {
  id: string;
  stock_code: string;
  stock_name: string;
  transaction_type: 'buy' | 'sell';
  quantity: number;
  price: number;
  total_amount: number;
  transaction_date: string;
  notes?: string;
  created_at: string;
}

interface InvestmentProps {
  user: User;
}

export default function Investment({ user }: InvestmentProps) {
  const [records, setRecords] = useState<InvestmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    stock_code: '',
    stock_name: '',
    transaction_type: 'buy' as 'buy' | 'sell',
    quantity: '',
    price: '',
    transaction_date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInvestmentRecords();
  }, [user]);

  const fetchInvestmentRecords = async () => {
    try {
      // 먼저 사용자 프로필 ID 조회
      const { data: profile } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) return;

      const { data, error } = await supabase
        .from('investment_records_2025_09_27_12_14')
        .select('*')
        .eq('user_id', profile.id)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('투자 기록 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // 사용자 프로필 ID 조회
      const { data: profile } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('사용자 프로필을 찾을 수 없습니다');

      const totalAmount = parseFloat(formData.price) * parseInt(formData.quantity);

      const { error } = await supabase
        .from('investment_records_2025_09_27_12_14')
        .insert({
          user_id: profile.id,
          stock_code: formData.stock_code.toUpperCase(),
          stock_name: formData.stock_name,
          transaction_type: formData.transaction_type,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price),
          total_amount: totalAmount,
          transaction_date: formData.transaction_date,
          notes: formData.notes || null
        });

      if (error) throw error;

      // 참여 점수 추가
      await supabase
        .from('participation_logs_2025_09_27_12_14')
        .insert({
          user_id: profile.id,
          activity_type: 'investment_record',
          points: 50,
          description: `${formData.stock_name} ${formData.transaction_type === 'buy' ? '매수' : '매도'} 기록 추가`
        });

      // 사용자 참여 점수 업데이트
      await supabase
        .from('user_profiles_2025_09_27_12_14')
        .update({
          participation_score: profile.participation_score + 50
        })
        .eq('id', profile.id);

      toast({
        title: "투자 기록 추가 완료",
        description: "투자 기록이 성공적으로 추가되었습니다.",
      });

      // 폼 초기화 및 목록 새로고침
      setFormData({
        stock_code: '',
        stock_name: '',
        transaction_type: 'buy',
        quantity: '',
        price: '',
        transaction_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
      setShowForm(false);
      fetchInvestmentRecords();

    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  if (loading && records.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">투자 기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">투자 기록</h1>
            <p className="text-gray-600 mt-1">나의 투자 활동을 기록하고 관리하세요</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            투자 기록 추가
          </Button>
        </div>

        {/* 투자 기록 추가 폼 */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>새 투자 기록 추가</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock_code">종목 코드</Label>
                    <Input
                      id="stock_code"
                      placeholder="예: 005930"
                      value={formData.stock_code}
                      onChange={(e) => setFormData({...formData, stock_code: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_name">종목명</Label>
                    <Input
                      id="stock_name"
                      placeholder="예: 삼성전자"
                      value={formData.stock_name}
                      onChange={(e) => setFormData({...formData, stock_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction_type">거래 유형</Label>
                    <Select 
                      value={formData.transaction_type} 
                      onValueChange={(value: 'buy' | 'sell') => setFormData({...formData, transaction_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buy">매수</SelectItem>
                        <SelectItem value="sell">매도</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">수량</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="예: 10"
                      value={formData.quantity}
                      onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">단가 (원)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      placeholder="예: 75000"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction_date">거래일</Label>
                    <Input
                      id="transaction_date"
                      type="date"
                      value={formData.transaction_date}
                      onChange={(e) => setFormData({...formData, transaction_date: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">메모 (선택사항)</Label>
                  <Textarea
                    id="notes"
                    placeholder="투자 이유나 기타 메모를 입력하세요"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
                {formData.quantity && formData.price && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">총 거래 금액</p>
                    <p className="text-xl font-bold text-blue-600">
                      {formatCurrency(parseFloat(formData.price) * parseInt(formData.quantity))}
                    </p>
                  </div>
                )}
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? '추가 중...' : '기록 추가'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 투자 기록 목록 */}
        <div className="space-y-4">
          {records.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">투자 기록이 없습니다</h3>
                <p className="text-gray-600 mb-4">첫 번째 투자 기록을 추가해보세요!</p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  투자 기록 추가
                </Button>
              </CardContent>
            </Card>
          ) : (
            records.map((record) => (
              <Card key={record.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-full ${record.transaction_type === 'buy' ? 'bg-green-100' : 'bg-red-100'}`}>
                        {record.transaction_type === 'buy' ? (
                          <TrendingUp className={`h-6 w-6 ${record.transaction_type === 'buy' ? 'text-green-600' : 'text-red-600'}`} />
                        ) : (
                          <TrendingDown className={`h-6 w-6 ${record.transaction_type === 'buy' ? 'text-green-600' : 'text-red-600'}`} />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{record.stock_name}</h3>
                          <Badge variant="outline">{record.stock_code}</Badge>
                          <Badge variant={record.transaction_type === 'buy' ? 'default' : 'destructive'}>
                            {record.transaction_type === 'buy' ? '매수' : '매도'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>수량: {record.quantity.toLocaleString()}주</span>
                          <span>단가: {formatCurrency(record.price)}</span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(record.transaction_date)}</span>
                          </div>
                        </div>
                        {record.notes && (
                          <p className="text-sm text-gray-500 mt-2">{record.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">총 거래금액</p>
                      <p className="text-xl font-bold">{formatCurrency(record.total_amount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}