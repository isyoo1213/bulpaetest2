import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { 
  FileText, 
  Download, 
  Star, 
  Eye, 
  ShoppingCart, 
  Coins, 
  Plus,
  Search,
  Filter,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  Globe,
  Activity,
  User as UserIcon,
  Calendar,
  Tag,
  Heart,
  MessageCircle,
  Award,
  DollarSign
} from 'lucide-react';

interface Report {
  id: string;
  title: string;
  description: string;
  content: string;
  price: number;
  page_count: number;
  tags: string[];
  view_count: number;
  download_count: number;
  rating_average: number;
  rating_count: number;
  created_at: string;
  author_name: string;
  category_name: string;
  category_icon: string;
  is_purchased: boolean;
  is_free: boolean;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface UserPoints {
  current_points: number;
  total_earned: number;
  total_spent: number;
}

interface ReportMarketplaceProps {
  user: User;
}

export default function ReportMarketplace({ user }: ReportMarketplaceProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [myReports, setMyReports] = useState<Report[]>([]);
  const [purchasedReports, setPurchasedReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('latest');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // 새 레포트 작성 상태
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    content: '',
    category_id: '',
    price: 0,
    page_count: 1,
    tags: ''
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
        await Promise.all([
          fetchUserPoints(profile.id),
          fetchReports(),
          fetchCategories(),
          fetchMyReports(profile.id),
          fetchPurchasedReports(profile.id)
        ]);
      }

    } catch (error) {
      console.error('초기 데이터 조회 오류:', error);
      toast({
        title: "오류",
        description: "데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPoints = async (userId: string) => {
    const { data } = await supabase
      .from('user_points_2025_09_28_06_00')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (data) {
      setUserPoints(data);
    }
  };

  const fetchReports = async () => {
    const { data } = await supabase
      .from('reports_2025_09_28_06_00')
      .select(`
        *,
        report_categories_2025_09_28_06_00 (name, icon),
        user_profiles_2025_09_27_12_14 (full_name)
      `)
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (data) {
      const reportsWithDetails = data.map(report => ({
        ...report,
        author_name: report.user_profiles_2025_09_27_12_14?.full_name || '익명',
        category_name: report.report_categories_2025_09_28_06_00?.name || '기타',
        category_icon: report.report_categories_2025_09_28_06_00?.icon || 'FileText',
        is_free: report.price === 0,
        is_purchased: false // 나중에 구매 여부 확인
      }));
      setReports(reportsWithDetails);
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('report_categories_2025_09_28_06_00')
      .select('*')
      .order('name');

    if (data) {
      setCategories(data);
    }
  };

  const fetchMyReports = async (userId: string) => {
    const { data } = await supabase
      .from('reports_2025_09_28_06_00')
      .select(`
        *,
        report_categories_2025_09_28_06_00 (name, icon)
      `)
      .eq('author_id', userId)
      .order('created_at', { ascending: false });

    if (data) {
      const reportsWithDetails = data.map(report => ({
        ...report,
        author_name: userProfile?.full_name || '나',
        category_name: report.report_categories_2025_09_28_06_00?.name || '기타',
        category_icon: report.report_categories_2025_09_28_06_00?.icon || 'FileText',
        is_free: report.price === 0,
        is_purchased: true
      }));
      setMyReports(reportsWithDetails);
    }
  };

  const fetchPurchasedReports = async (userId: string) => {
    const { data } = await supabase
      .from('report_purchases_2025_09_28_06_00')
      .select(`
        *,
        reports_2025_09_28_06_00 (
          *,
          report_categories_2025_09_28_06_00 (name, icon),
          user_profiles_2025_09_27_12_14 (full_name)
        )
      `)
      .eq('buyer_id', userId)
      .eq('payment_status', 'completed')
      .order('purchased_at', { ascending: false });

    if (data) {
      const reportsWithDetails = data.map(purchase => {
        const report = purchase.reports_2025_09_28_06_00;
        return {
          ...report,
          author_name: report.user_profiles_2025_09_27_12_14?.full_name || '익명',
          category_name: report.report_categories_2025_09_28_06_00?.name || '기타',
          category_icon: report.report_categories_2025_09_28_06_00?.icon || 'FileText',
          is_free: report.price === 0,
          is_purchased: true,
          purchased_at: purchase.purchased_at,
          download_count: purchase.download_count
        };
      });
      setPurchasedReports(reportsWithDetails);
    }
  };

  const handlePurchaseReport = async (reportId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('report_purchase_and_download_2025_09_28_06_00', {
        body: { reportId },
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "구매 완료",
          description: "레포트를 성공적으로 구매했습니다!",
        });
        
        // 데이터 새로고침
        await fetchInitialData();
      } else {
        throw new Error(data.error || '구매 실패');
      }

    } catch (error: any) {
      console.error('구매 오류:', error);
      toast({
        title: "구매 실패",
        description: error.message || "레포트 구매 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadReport = async (reportId: string, title: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('report_purchase_and_download_2025_09_28_06_00', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (error) throw error;

      // PDF 다운로드 시뮬레이션
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${title}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "다운로드 완료",
        description: "PDF 파일이 다운로드되었습니다.",
      });

    } catch (error: any) {
      console.error('다운로드 오류:', error);
      toast({
        title: "다운로드 실패",
        description: "PDF 다운로드 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleCreateReport = async () => {
    try {
      if (!newReport.title || !newReport.description || !newReport.content || !newReport.category_id) {
        toast({
          title: "입력 오류",
          description: "모든 필수 항목을 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('reports_2025_09_28_06_00')
        .insert({
          title: newReport.title,
          description: newReport.description,
          content: newReport.content,
          category_id: newReport.category_id,
          author_id: userProfile.id,
          price: newReport.price,
          page_count: newReport.page_count,
          tags: newReport.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
          status: 'published'
        });

      if (error) throw error;

      toast({
        title: "레포트 등록 완료",
        description: "새 레포트가 성공적으로 등록되었습니다!",
      });

      setShowCreateDialog(false);
      setNewReport({
        title: '',
        description: '',
        content: '',
        category_id: '',
        price: 0,
        page_count: 1,
        tags: ''
      });

      await fetchInitialData();

    } catch (error: any) {
      console.error('레포트 등록 오류:', error);
      toast({
        title: "등록 실패",
        description: "레포트 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      TrendingUp, BarChart3, PieChart, Target, Globe, Activity, FileText
    };
    const IconComponent = icons[iconName] || FileText;
    return <IconComponent className="h-4 w-4" />;
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || report.category_id === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortedReports = [...filteredReports].sort((a, b) => {
    switch (sortBy) {
      case 'price_low':
        return a.price - b.price;
      case 'price_high':
        return b.price - a.price;
      case 'rating':
        return b.rating_average - a.rating_average;
      case 'popular':
        return b.download_count - a.download_count;
      default: // latest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const renderReportCard = (report: Report, showPurchaseButton = true) => (
    <Card key={report.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              {getIconComponent(report.category_icon)}
              <Badge variant="outline">{report.category_name}</Badge>
              {report.is_free && <Badge className="bg-green-100 text-green-800">무료</Badge>}
            </div>
            <CardTitle className="text-lg mb-2">{report.title}</CardTitle>
            <p className="text-sm text-gray-600 mb-3">{report.description}</p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <UserIcon className="h-3 w-3" />
                <span>{report.author_name}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{new Date(report.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="h-3 w-3" />
                <span>{report.page_count}페이지</span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            {report.is_free ? (
              <div className="text-lg font-bold text-green-600">무료</div>
            ) : (
              <div className="text-lg font-bold text-blue-600">{report.price.toLocaleString()}P</div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-1">
              <Eye className="h-4 w-4" />
              <span>{report.view_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="h-4 w-4" />
              <span>{report.download_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>{report.rating_average.toFixed(1)} ({report.rating_count})</span>
            </div>
          </div>
        </div>

        {report.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {report.tags.map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                <Tag className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex space-x-2">
          {report.is_purchased ? (
            <Button 
              onClick={() => handleDownloadReport(report.id, report.title)}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF 다운로드
            </Button>
          ) : showPurchaseButton && (
            <Button 
              onClick={() => handlePurchaseReport(report.id)}
              className="flex-1"
              disabled={!report.is_free && (!userPoints || userPoints.current_points < report.price)}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {report.is_free ? '무료 다운로드' : '구매하기'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">레포트 마켓플레이스를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">레포트 마켓플레이스</h1>
            <p className="text-gray-600">투자 전문가들의 분석 레포트를 구매하고 판매하세요</p>
          </div>
          
          <div className="flex items-center space-x-4">
            {userPoints && (
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Coins className="h-5 w-5 text-yellow-500" />
                  <div>
                    <div className="font-bold text-lg">{userPoints.current_points.toLocaleString()}P</div>
                    <div className="text-xs text-gray-500">보유 포인트</div>
                  </div>
                </div>
              </Card>
            )}
            
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  레포트 등록
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>새 레포트 등록</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">제목 *</label>
                    <Input
                      value={newReport.title}
                      onChange={(e) => setNewReport({...newReport, title: e.target.value})}
                      placeholder="레포트 제목을 입력하세요"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">카테고리 *</label>
                    <Select value={newReport.category_id} onValueChange={(value) => setNewReport({...newReport, category_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="카테고리를 선택하세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">설명 *</label>
                    <Textarea
                      value={newReport.description}
                      onChange={(e) => setNewReport({...newReport, description: e.target.value})}
                      placeholder="레포트에 대한 간단한 설명을 입력하세요"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">내용 *</label>
                    <Textarea
                      value={newReport.content}
                      onChange={(e) => setNewReport({...newReport, content: e.target.value})}
                      placeholder="레포트의 전체 내용을 입력하세요 (마크다운 형식 지원)"
                      rows={10}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">가격 (포인트)</label>
                      <Input
                        type="number"
                        value={newReport.price}
                        onChange={(e) => setNewReport({...newReport, price: parseInt(e.target.value) || 0})}
                        placeholder="0 (무료)"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">페이지 수</label>
                      <Input
                        type="number"
                        value={newReport.page_count}
                        onChange={(e) => setNewReport({...newReport, page_count: parseInt(e.target.value) || 1})}
                        placeholder="1"
                        min="1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">태그</label>
                    <Input
                      value={newReport.tags}
                      onChange={(e) => setNewReport({...newReport, tags: e.target.value})}
                      placeholder="태그를 쉼표로 구분하여 입력하세요 (예: 삼성전자, 반도체, 기술주)"
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      취소
                    </Button>
                    <Button onClick={handleCreateReport}>
                      등록하기
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="marketplace" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="marketplace">마켓플레이스</TabsTrigger>
            <TabsTrigger value="my-reports">내 레포트</TabsTrigger>
            <TabsTrigger value="purchased">구매한 레포트</TabsTrigger>
          </TabsList>

          {/* 마켓플레이스 */}
          <TabsContent value="marketplace" className="space-y-6">
            {/* 검색 및 필터 */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="레포트 제목, 설명, 태그로 검색..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="카테고리" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 카테고리</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="정렬" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="latest">최신순</SelectItem>
                      <SelectItem value="popular">인기순</SelectItem>
                      <SelectItem value="rating">평점순</SelectItem>
                      <SelectItem value="price_low">가격 낮은순</SelectItem>
                      <SelectItem value="price_high">가격 높은순</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* 레포트 목록 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedReports.map(report => renderReportCard(report))}
            </div>

            {sortedReports.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">검색 조건에 맞는 레포트가 없습니다.</p>
              </div>
            )}
          </TabsContent>

          {/* 내 레포트 */}
          <TabsContent value="my-reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myReports.map(report => renderReportCard(report, false))}
            </div>

            {myReports.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">등록한 레포트가 없습니다.</p>
                <Button className="mt-4" onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  첫 레포트 등록하기
                </Button>
              </div>
            )}
          </TabsContent>

          {/* 구매한 레포트 */}
          <TabsContent value="purchased" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {purchasedReports.map(report => renderReportCard(report, false))}
            </div>

            {purchasedReports.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">구매한 레포트가 없습니다.</p>
                <Button className="mt-4" onClick={() => window.location.reload()}>
                  <Search className="h-4 w-4 mr-2" />
                  레포트 둘러보기
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}