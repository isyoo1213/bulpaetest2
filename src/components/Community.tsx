import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, MessageCircle, Heart, TrendingUp, Calendar, User as UserIcon } from 'lucide-react';

interface InvestmentIdea {
  id: string;
  title: string;
  content: string;
  stock_code?: string;
  stock_name?: string;
  target_price?: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user_profiles_2025_09_27_12_14: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_profiles_2025_09_27_12_14: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

interface CommunityProps {
  user: User;
}

export default function Community({ user }: CommunityProps) {
  const [ideas, setIdeas] = useState<InvestmentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    stock_code: '',
    stock_name: '',
    target_price: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchInvestmentIdeas();
  }, [user]);

  const fetchInvestmentIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('investment_ideas_2025_09_27_12_14')
        .select(`
          *,
          user_profiles_2025_09_27_12_14 (
            username,
            full_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas(data || []);
    } catch (error) {
      console.error('투자 아이디어 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (ideaId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments_2025_09_27_12_14')
        .select(`
          *,
          user_profiles_2025_09_27_12_14 (
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('idea_id', ideaId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('댓글 조회 오류:', error);
    }
  };

  const handleSubmitIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // 사용자 프로필 및 그룹 정보 조회
      const { data: profile } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('사용자 프로필을 찾을 수 없습니다');

      // 첫 번째 그룹 조회 (임시)
      const { data: membership } = await supabase
        .from('group_memberships_2025_09_27_12_14')
        .select('group_id')
        .eq('user_id', profile.id)
        .limit(1)
        .single();

      const { error } = await supabase
        .from('investment_ideas_2025_09_27_12_14')
        .insert({
          user_id: profile.id,
          group_id: membership?.group_id || null,
          title: formData.title,
          content: formData.content,
          stock_code: formData.stock_code || null,
          stock_name: formData.stock_name || null,
          target_price: formData.target_price ? parseFloat(formData.target_price) : null
        });

      if (error) throw error;

      // 참여 점수 추가
      await supabase
        .from('participation_logs_2025_09_27_12_14')
        .insert({
          user_id: profile.id,
          activity_type: 'idea_shared',
          points: 100,
          description: `투자 아이디어 "${formData.title}" 공유`
        });

      toast({
        title: "아이디어 공유 완료",
        description: "투자 아이디어가 성공적으로 공유되었습니다.",
      });

      // 폼 초기화 및 목록 새로고침
      setFormData({
        title: '',
        content: '',
        stock_code: '',
        stock_name: '',
        target_price: ''
      });
      setShowForm(false);
      fetchInvestmentIdeas();

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

  const handleSubmitComment = async (ideaId: string) => {
    if (!newComment.trim()) return;

    try {
      const { data: profile } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) throw new Error('사용자 프로필을 찾을 수 없습니다');

      const { error } = await supabase
        .from('comments_2025_09_27_12_14')
        .insert({
          user_id: profile.id,
          idea_id: ideaId,
          content: newComment
        });

      if (error) throw error;

      // 댓글 수 업데이트
      await supabase
        .from('investment_ideas_2025_09_27_12_14')
        .update({
          comments_count: comments.length + 1
        })
        .eq('id', ideaId);

      setNewComment('');
      fetchComments(ideaId);
      fetchInvestmentIdeas();

      toast({
        title: "댓글 작성 완료",
        description: "댓글이 성공적으로 작성되었습니다.",
      });

    } catch (error: any) {
      toast({
        title: "오류 발생",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '오늘';
    if (diffDays === 2) return '어제';
    if (diffDays <= 7) return `${diffDays - 1}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && ideas.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">커뮤니티를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">투자 아이디어</h1>
            <p className="text-gray-600 mt-1">그룹원들과 투자 아이디어를 공유하고 토론하세요</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            아이디어 공유
          </Button>
        </div>

        {/* 아이디어 작성 폼 */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>새 투자 아이디어 공유</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitIdea} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    placeholder="투자 아이디어 제목을 입력하세요"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock_code">종목 코드 (선택)</Label>
                    <Input
                      id="stock_code"
                      placeholder="예: 005930"
                      value={formData.stock_code}
                      onChange={(e) => setFormData({...formData, stock_code: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock_name">종목명 (선택)</Label>
                    <Input
                      id="stock_name"
                      placeholder="예: 삼성전자"
                      value={formData.stock_name}
                      onChange={(e) => setFormData({...formData, stock_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_price">목표가 (선택)</Label>
                    <Input
                      id="target_price"
                      type="number"
                      placeholder="예: 80000"
                      value={formData.target_price}
                      onChange={(e) => setFormData({...formData, target_price: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    placeholder="투자 아이디어의 근거와 분석을 자세히 작성해주세요"
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    rows={6}
                    required
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit" disabled={loading}>
                    {loading ? '공유 중...' : '아이디어 공유'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* 아이디어 목록 */}
        <div className="space-y-6">
          {ideas.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 공유된 아이디어가 없습니다</h3>
                <p className="text-gray-600 mb-4">첫 번째 투자 아이디어를 공유해보세요!</p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  아이디어 공유
                </Button>
              </CardContent>
            </Card>
          ) : (
            ideas.map((idea) => (
              <Card key={idea.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* 아이디어 헤더 */}
                  <div className="flex items-start space-x-4 mb-4">
                    <Avatar>
                      <AvatarImage src={idea.user_profiles_2025_09_27_12_14.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                        {idea.user_profiles_2025_09_27_12_14.full_name?.charAt(0) || 
                         idea.user_profiles_2025_09_27_12_14.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold">{idea.user_profiles_2025_09_27_12_14.full_name}</h3>
                        <span className="text-sm text-gray-500">@{idea.user_profiles_2025_09_27_12_14.username}</span>
                        <div className="flex items-center space-x-1 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(idea.created_at)}</span>
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">{idea.title}</h2>
                      
                      {/* 종목 정보 */}
                      {idea.stock_name && (
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge variant="outline" className="bg-blue-50">
                            {idea.stock_code && `${idea.stock_code} - `}{idea.stock_name}
                          </Badge>
                          {idea.target_price && (
                            <Badge variant="secondary" className="bg-green-50">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              목표가 {formatCurrency(idea.target_price)}
                            </Badge>
                          )}
                        </div>
                      )}
                      
                      {/* 내용 */}
                      <p className="text-gray-700 whitespace-pre-wrap mb-4">{idea.content}</p>
                      
                      {/* 액션 버튼들 */}
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-red-500"
                        >
                          <Heart className="h-4 w-4 mr-1" />
                          {idea.likes_count}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-500 hover:text-blue-500"
                          onClick={() => {
                            if (selectedIdea === idea.id) {
                              setSelectedIdea(null);
                            } else {
                              setSelectedIdea(idea.id);
                              fetchComments(idea.id);
                            }
                          }}
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {idea.comments_count}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* 댓글 섹션 */}
                  {selectedIdea === idea.id && (
                    <div className="border-t pt-4 mt-4">
                      {/* 댓글 목록 */}
                      <div className="space-y-3 mb-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.user_profiles_2025_09_27_12_14.avatar_url} />
                              <AvatarFallback className="bg-gray-200 text-xs">
                                {comment.user_profiles_2025_09_27_12_14.full_name?.charAt(0) || 
                                 comment.user_profiles_2025_09_27_12_14.username.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-medium">
                                  {comment.user_profiles_2025_09_27_12_14.full_name}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {formatDate(comment.created_at)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 댓글 작성 */}
                      <div className="flex space-x-2">
                        <Input
                          placeholder="댓글을 작성하세요..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              handleSubmitComment(idea.id);
                            }
                          }}
                        />
                        <Button 
                          size="sm" 
                          onClick={() => handleSubmitComment(idea.id)}
                          disabled={!newComment.trim()}
                        >
                          작성
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}