import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, TrendingDown, Target, Award, Users, Activity } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  initial_capital: number;
  current_capital: number;
  total_return_rate: number;
  participation_score: number;
  level: number;
}

interface DashboardProps {
  user: User;
}

export default function Dashboard({ user }: DashboardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupRank, setGroupRank] = useState<number>(0);
  const [totalMembers, setTotalMembers] = useState<number>(0);

  useEffect(() => {
    fetchUserProfile();
    fetchRankingInfo();
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('프로필 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankingInfo = async () => {
    try {
      // 전체 사용자 수 조회
      const { count } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('*', { count: 'exact', head: true });

      setTotalMembers(count || 0);

      // 현재 사용자 순위 조회
      const { data: rankData } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('id, total_return_rate, participation_score')
        .order('total_return_rate', { ascending: false });

      if (rankData) {
        const userRank = rankData.findIndex(u => u.id === profile?.id) + 1;
        setGroupRank(userRank);
      }
    } catch (error) {
      console.error('순위 조회 오류:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getReturnColor = (returnRate: number) => {
    if (returnRate > 0) return 'text-green-600';
    if (returnRate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getReturnIcon = (returnRate: number) => {
    return returnRate >= 0 ? TrendingUp : TrendingDown;
  };

  const getLevelProgress = (level: number) => {
    return ((level % 10) / 10) * 100;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <p className="text-gray-600">프로필을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const ReturnIcon = getReturnIcon(profile.total_return_rate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-green-600 text-white text-xl">
                {profile.full_name?.charAt(0) || profile.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
              <p className="text-gray-600">@{profile.username}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-green-100">
                  Level {profile.level}
                </Badge>
                <Badge variant="outline">
                  #{groupRank} / {totalMembers}
                </Badge>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">총 수익률</p>
            <div className={`flex items-center space-x-1 ${getReturnColor(profile.total_return_rate)}`}>
              <ReturnIcon className="h-5 w-5" />
              <span className="text-2xl font-bold">
                {profile.total_return_rate > 0 ? '+' : ''}{profile.total_return_rate.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* 메인 통계 카드들 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 현재 자산 */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">현재 자산</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(profile.current_capital)}</div>
              <p className="text-xs opacity-75 mt-1">
                초기 자본: {formatCurrency(profile.initial_capital)}
              </p>
            </CardContent>
          </Card>

          {/* 수익/손실 */}
          <Card className={`${profile.total_return_rate >= 0 ? 'bg-gradient-to-br from-green-500 to-green-600' : 'bg-gradient-to-br from-red-500 to-red-600'} text-white`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90">수익/손실</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(profile.current_capital - profile.initial_capital)}
              </div>
              <div className="flex items-center space-x-1 text-xs opacity-75 mt-1">
                <ReturnIcon className="h-3 w-3" />
                <span>{profile.total_return_rate > 0 ? '+' : ''}{profile.total_return_rate.toFixed(2)}%</span>
              </div>
            </CardContent>
          </Card>

          {/* 참여 점수 */}
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center space-x-1">
                <Activity className="h-4 w-4" />
                <span>참여 점수</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile.participation_score.toLocaleString()}</div>
              <p className="text-xs opacity-75 mt-1">활동량 기반</p>
            </CardContent>
          </Card>

          {/* 레벨 진행도 */}
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium opacity-90 flex items-center space-x-1">
                <Award className="h-4 w-4" />
                <span>레벨 {profile.level}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={getLevelProgress(profile.level)} className="mb-2 bg-white/20" />
              <p className="text-xs opacity-75">다음 레벨까지 {100 - getLevelProgress(profile.level)}%</p>
            </CardContent>
          </Card>
        </div>

        {/* 상세 정보 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 투자 성과 차트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <span>투자 성과</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>투자 기록을 추가하면 차트가 표시됩니다</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 그룹 순위 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <span>그룹 순위</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg border border-yellow-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold">
                      {groupRank}
                    </div>
                    <div>
                      <p className="font-semibold">{profile.full_name}</p>
                      <p className="text-sm text-gray-600">나의 순위</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{profile.total_return_rate > 0 ? '+' : ''}{profile.total_return_rate.toFixed(2)}%</p>
                    <p className="text-sm text-gray-600">{profile.participation_score}점</p>
                  </div>
                </div>
                <div className="text-center text-gray-500 py-8">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>다른 멤버들의 순위는 곧 업데이트됩니다</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 목표 및 업적 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 이번 달 목표 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span>이번 달 목표</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>수익률 목표: 5%</span>
                    <span>{profile.total_return_rate.toFixed(2)}% / 5%</span>
                  </div>
                  <Progress value={Math.min((profile.total_return_rate / 5) * 100, 100)} />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>참여 점수 목표: 1000점</span>
                    <span>{profile.participation_score} / 1000점</span>
                  </div>
                  <Progress value={Math.min((profile.participation_score / 1000) * 100, 100)} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 최근 업적 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-purple-600" />
                <span>최근 업적</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <Award className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>활동을 시작하면 업적을 획득할 수 있습니다</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}