import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Medal, Award, TrendingUp, Users, Activity } from 'lucide-react';

interface RankingUser {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  total_return_rate: number;
  participation_score: number;
  level: number;
  current_capital: number;
  initial_capital: number;
}

interface RankingProps {
  user: User;
}

export default function Ranking({ user }: RankingProps) {
  const [users, setUsers] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'return_rate' | 'participation' | 'combined'>('combined');
  const [currentUser, setCurrentUser] = useState<RankingUser | null>(null);

  useEffect(() => {
    fetchRankingData();
  }, [user, sortBy]);

  const fetchRankingData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('*')
        .order(getSortColumn(), { ascending: false });

      if (error) throw error;

      const sortedUsers = data?.sort((a, b) => {
        switch (sortBy) {
          case 'return_rate':
            return b.total_return_rate - a.total_return_rate;
          case 'participation':
            return b.participation_score - a.participation_score;
          case 'combined':
            const scoreA = (a.total_return_rate * 0.6) + (a.participation_score * 0.4 / 100);
            const scoreB = (b.total_return_rate * 0.6) + (b.participation_score * 0.4 / 100);
            return scoreB - scoreA;
          default:
            return 0;
        }
      }) || [];

      setUsers(sortedUsers);
      
      // 현재 사용자 찾기
      const current = sortedUsers.find(u => u.user_id === user.id);
      setCurrentUser(current || null);

    } catch (error) {
      console.error('순위 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSortColumn = () => {
    switch (sortBy) {
      case 'return_rate':
        return 'total_return_rate';
      case 'participation':
        return 'participation_score';
      default:
        return 'total_return_rate';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />;
      default:
        return (
          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold text-gray-600">
            {rank}
          </div>
        );
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
      default:
        return 'bg-gray-100 text-gray-700';
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

  const getCombinedScore = (user: RankingUser) => {
    return ((user.total_return_rate * 0.6) + (user.participation_score * 0.4 / 100)).toFixed(2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">순위를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">불패스터디 순위</h1>
          <p className="text-gray-600">그룹원들의 투자 성과와 참여도를 확인하세요</p>
        </div>

        {/* 정렬 옵션 */}
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setSortBy('combined')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'combined'
                ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            종합 순위
          </button>
          <button
            onClick={() => setSortBy('return_rate')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'return_rate'
                ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            수익률 순위
          </button>
          <button
            onClick={() => setSortBy('participation')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              sortBy === 'participation'
                ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            참여도 순위
          </button>
        </div>

        {/* 내 순위 하이라이트 */}
        {currentUser && (
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>나의 현재 순위</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {getRankIcon(users.findIndex(u => u.id === currentUser.id) + 1)}
                    <Badge className={getRankBadgeColor(users.findIndex(u => u.id === currentUser.id) + 1)}>
                      #{users.findIndex(u => u.id === currentUser.id) + 1}
                    </Badge>
                  </div>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={currentUser.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                      {currentUser.full_name?.charAt(0) || currentUser.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg">{currentUser.full_name}</h3>
                    <p className="text-gray-600">@{currentUser.username}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <div className={`text-xl font-bold ${getReturnColor(currentUser.total_return_rate)}`}>
                    {currentUser.total_return_rate > 0 ? '+' : ''}{currentUser.total_return_rate.toFixed(2)}%
                  </div>
                  <div className="text-sm text-gray-600">
                    참여점수: {currentUser.participation_score.toLocaleString()}
                  </div>
                  {sortBy === 'combined' && (
                    <div className="text-sm text-blue-600 font-medium">
                      종합점수: {getCombinedScore(currentUser)}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 순위 목록 */}
        <div className="space-y-3">
          {users.map((rankUser, index) => {
            const rank = index + 1;
            const isCurrentUser = rankUser.user_id === user.id;
            
            return (
              <Card 
                key={rankUser.id} 
                className={`hover:shadow-md transition-shadow ${
                  isCurrentUser ? 'ring-2 ring-blue-200 bg-blue-50/50' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* 순위 아이콘 */}
                      <div className="flex items-center space-x-2">
                        {getRankIcon(rank)}
                        <Badge className={getRankBadgeColor(rank)}>
                          #{rank}
                        </Badge>
                      </div>

                      {/* 사용자 정보 */}
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={rankUser.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
                          {rankUser.full_name?.charAt(0) || rankUser.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg flex items-center space-x-2">
                          <span>{rankUser.full_name}</span>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">나</Badge>
                          )}
                        </h3>
                        <p className="text-gray-600">@{rankUser.username}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            Level {rankUser.level}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* 성과 지표 */}
                    <div className="text-right space-y-2">
                      {/* 수익률 */}
                      <div>
                        <p className="text-sm text-gray-600">수익률</p>
                        <div className={`text-xl font-bold flex items-center space-x-1 ${getReturnColor(rankUser.total_return_rate)}`}>
                          <TrendingUp className="h-4 w-4" />
                          <span>
                            {rankUser.total_return_rate > 0 ? '+' : ''}{rankUser.total_return_rate.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      {/* 참여 점수 */}
                      <div>
                        <p className="text-sm text-gray-600">참여 점수</p>
                        <div className="text-lg font-semibold flex items-center space-x-1 text-purple-600">
                          <Activity className="h-4 w-4" />
                          <span>{rankUser.participation_score.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* 종합 점수 (종합 순위일 때만) */}
                      {sortBy === 'combined' && (
                        <div>
                          <p className="text-sm text-gray-600">종합 점수</p>
                          <div className="text-lg font-semibold text-blue-600">
                            {getCombinedScore(rankUser)}
                          </div>
                        </div>
                      )}

                      {/* 자산 정보 */}
                      <div className="text-xs text-gray-500">
                        <p>현재 자산: {formatCurrency(rankUser.current_capital)}</p>
                        <p>
                          손익: {formatCurrency(rankUser.current_capital - rankUser.initial_capital)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 진행률 바 (종합 순위일 때) */}
                  {sortBy === 'combined' && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>수익률 기여도 (60%)</span>
                        <span>{(rankUser.total_return_rate * 0.6).toFixed(2)}점</span>
                      </div>
                      <Progress 
                        value={Math.max(0, Math.min(100, (rankUser.total_return_rate + 50) * 2))} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>참여도 기여도 (40%)</span>
                        <span>{(rankUser.participation_score * 0.4 / 100).toFixed(2)}점</span>
                      </div>
                      <Progress 
                        value={Math.min(100, (rankUser.participation_score / 25))} 
                        className="h-2"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {users.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 순위 데이터가 없습니다</h3>
              <p className="text-gray-600">투자 활동을 시작하면 순위가 표시됩니다!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}