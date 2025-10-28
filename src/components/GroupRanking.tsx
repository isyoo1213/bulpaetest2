import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  TrendingUp, 
  Users, 
  Activity, 
  Crown,
  Medal,
  Award,
  Target,
  BarChart3,
  Star,
  Zap
} from 'lucide-react';

interface GroupRankingData {
  id: string;
  name: string;
  description: string;
  leader_name: string;
  member_count: number;
  avg_participation_score: number;
  avg_return_rate: number;
  total_allocation: number;
  portfolio_count: number;
  return_rank: number;
  participation_rank: number;
  comprehensive_score: number;
  comprehensive_rank: number;
  return_multiplier: number;
}

interface GroupRankingProps {
  user: User;
}

export default function GroupRanking({ user }: GroupRankingProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userGroup, setUserGroup] = useState<any>(null);
  const [groupRankings, setGroupRankings] = useState<GroupRankingData[]>([]);
  const [loading, setLoading] = useState(false);

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
        }

        // 그룹 순위 데이터 조회
        await fetchGroupRankings();
      }

    } catch (error) {
      console.error('초기 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupRankings = async () => {
    try {
      // 팀 포트폴리오 기반 수익률 계산 (투자기록에서 본인팀 포트폴리오 반영)
      const { data: teamPortfolios } = await supabase
        .from('team_portfolios_2025_09_27_13_30')
        .select(`
          group_id,
          total_value,
          total_cost,
          study_groups_2025_09_27_12_14 (
            id,
            name,
            description
          )
        `);

      // 주간 평가 데이터에서 활동 점수 계산
      const { data: weeklyScores } = await supabase
        .from('member_weekly_scores_2025_10_20_08_10')
        .select(`
          member_id,
          final_score,
          weekly_evaluations_2025_10_20_08_10 (
            group_id,
            week_number
          ),
          user_profiles_2025_09_27_12_14 (
            id,
            full_name
          )
        `);

      // 모든 그룹 기본 정보 조회
      const { data: groups } = await supabase
        .from('study_groups_2025_09_27_12_14')
        .select(`
          id,
          name,
          description,
          user_profiles_2025_09_27_12_14!study_groups_2025_09_27_12_14_leader_id_fkey (
            full_name
          )
        `);

      if (!groups) return;

      // 각 그룹별 상세 정보 조회 및 계산
      const groupData = await Promise.all(
        groups.map(async (group) => {
          // 멤버 수 조회
          const { count: memberCount } = await supabase
            .from('group_memberships_2025_09_27_12_14')
            .select('*', { count: 'exact' })
            .eq('group_id', group.id);

          // 팀 포트폴리오에서 수익률 계산 (투자기록 반영)
          const teamPortfolio = teamPortfolios?.find(tp => tp.group_id === group.id);
          const returnRate = teamPortfolio 
            ? ((teamPortfolio.total_value - teamPortfolio.total_cost) / teamPortfolio.total_cost) * 100
            : 0;

          // 수익률 점수 계산 (사용자 가이드 기준: -5%=0점, 0%=10점, +5%=20점)
          const returnScore = Math.max(0, Math.min(20, 10 + (returnRate * 2)));

          // 주간 평가에서 활동 점수 계산 (최대 30점)
          const groupWeeklyScores = weeklyScores?.filter(ws => 
            ws.weekly_evaluations_2025_10_20_08_10?.group_id === group.id
          ) || [];
          
          // 참여점수(5) + 역할수행점수(10) + 추가활동점수(15) = 최대 30점
          const avgActivityScore = groupWeeklyScores.length > 0
            ? Math.min(30, groupWeeklyScores.reduce((sum, ws) => {
                const participated = ws.participated ? 5 : 0;
                const roleCompleted = ws.role_completed ? 10 : 0;
                const additionalActivity = Math.min(15, (ws.final_score || 0) - participated - roleCompleted);
                return sum + participated + roleCompleted + Math.max(0, additionalActivity);
              }, 0) / groupWeeklyScores.length)
            : 0;

          // 종합점수 = 활동점수 + 수익률점수 (사용자 가이드 기준)
          const comprehensiveScore = avgActivityScore + returnScore;

          return {
            id: group.id,
            name: group.name,
            description: group.description,
            leader_name: group.user_profiles_2025_09_27_12_14?.full_name || '',
            member_count: memberCount || 0,
            avg_participation_score: Math.round(avgActivityScore * 10) / 10, // 활동점수 (최대 30점)
            avg_return_rate: Math.round(returnRate * 10) / 10, // 수익률 (%)
            total_allocation: 100, // 기본값
            portfolio_count: teamPortfolio ? 1 : 0,
            return_rank: 0,
            participation_rank: 0,
            comprehensive_score: Math.round(comprehensiveScore * 10) / 10, // 종합점수 (활동+수익률)
            comprehensive_rank: 0,
            return_multiplier: Math.round(returnScore * 10) / 10 // 수익률점수 (최대 20점)
          };
        })
      );

      // 수익률 순위 계산 (수익률점수 기준)
      const sortedByReturn = [...groupData].sort((a, b) => b.return_multiplier - a.return_multiplier);
      sortedByReturn.forEach((group, index) => {
        group.return_rank = index + 1;
      });

      // 활동점수 순위 계산 (참여도 → 활동점수로 변경)
      const sortedByActivity = [...groupData].sort((a, b) => b.avg_participation_score - a.avg_participation_score);
      sortedByActivity.forEach((group, index) => {
        group.participation_rank = index + 1;
      });

      // 종합점수 순위 계산 (이미 계산됨: 활동점수 + 수익률점수)
      const sortedByComprehensive = [...groupData].sort((a, b) => b.comprehensive_score - a.comprehensive_score);
      sortedByComprehensive.forEach((group, index) => {
        group.comprehensive_rank = index + 1;
      });

      setGroupRankings(groupData);
    } catch (error) {
      console.error('그룹 순위 조회 오류:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-orange-500" />;
      default:
        return <Trophy className="h-5 w-5 text-blue-500" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-blue-600';
    if (percentage >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const renderRankingCard = (group: GroupRankingData, rankType: 'return' | 'participation' | 'comprehensive') => {
    let rank, score, maxScore, icon, title;
    
    switch (rankType) {
      case 'return':
        rank = group.return_rank;
        score = group.return_multiplier; // 수익률점수 (최대 20점)
        maxScore = 20; // 수익률점수 최대값
        icon = <TrendingUp className="h-5 w-5 text-green-600" />;
        title = '수익률점수 순위';
        break;
      case 'participation':
        rank = group.participation_rank;
        score = group.avg_participation_score; // 활동점수 (최대 30점)
        maxScore = 30; // 활동점수 최대값
        icon = <Activity className="h-5 w-5 text-blue-600" />;
        title = '활동점수 순위';
        break;
      case 'comprehensive':
        rank = group.comprehensive_rank;
        score = group.comprehensive_score; // 활동점수 + 수익률점수 (최대 50점)
        maxScore = 50; // 종합점수 최대값
        icon = <Star className="h-5 w-5 text-purple-600" />;
        title = '종합점수 순위';
        break;
    }

    const isMyTeam = group.id === userGroup?.id;

    return (
      <div key={`${group.id}-${rankType}`} className={`p-4 border rounded-lg transition-all hover:shadow-md ${isMyTeam ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getRankIcon(rank)}
              <Badge className={`${getRankBadgeColor(rank)} font-bold px-3 py-1`}>
                {rank}위
              </Badge>
            </div>
            <div>
              <h3 className="font-bold text-lg">{group.name}</h3>
              <p className="text-sm text-gray-600">팀장: {group.leader_name}</p>
            </div>
          </div>
          {isMyTeam && (
            <Badge className="bg-blue-100 text-blue-800">내 팀</Badge>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {icon}
            <span className="font-semibold">{title}</span>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${getScoreColor(score, maxScore)}`}>
              {rankType === 'return' ? `${group.return_multiplier}점` : 
               rankType === 'participation' ? `${score}점` : `${score}점`}
            </div>
            {rankType === 'comprehensive' && (
              <div className="text-xs text-gray-500">
                활동 {group.avg_participation_score}점 + 수익률 {group.return_multiplier}점
              </div>
            )}
            {rankType === 'return' && (
              <div className="text-xs text-gray-500">
                수익률 {group.avg_return_rate}%
              </div>
            )}
          </div>
        </div>

        <Progress 
          value={Math.min((score / maxScore) * 100, 100)} 
          className="h-2 mb-3" 
        />

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-gray-50 rounded">
            <Users className="h-4 w-4 mx-auto mb-1 text-gray-600" />
            <div className="font-semibold">{group.member_count}명</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <BarChart3 className="h-4 w-4 mx-auto mb-1 text-gray-600" />
            <div className="font-semibold">{group.portfolio_count}개</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <Target className="h-4 w-4 mx-auto mb-1 text-gray-600" />
            <div className="font-semibold">{group.total_allocation}%</div>
          </div>
        </div>

        {group.description && (
          <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
            {group.description}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">그룹 순위를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">그룹 순위</h1>
          <p className="text-gray-600">수익률, 활동점수, 종합점수별 그룹 순위를 확인하세요</p>
        </div>

        {/* 순위 요약 카드 */}
        {userGroup && (
          <Card className="border-blue-500 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-6 w-6 text-blue-600" />
                <span>내 팀 순위 요약</span>
                <Badge className="bg-blue-100 text-blue-800">{userGroup.name}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {groupRankings.find(g => g.id === userGroup.id) && (
                  <>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-600" />
                      <div className="text-2xl font-bold text-green-600">
                        {groupRankings.find(g => g.id === userGroup.id)?.return_rank}위
                      </div>
                      <p className="text-sm text-gray-600">수익률점수 순위</p>
                      <p className="text-xs text-gray-500">
                        {groupRankings.find(g => g.id === userGroup.id)?.return_multiplier}점 (수익률 {groupRankings.find(g => g.id === userGroup.id)?.avg_return_rate}%)
                      </p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                      <div className="text-2xl font-bold text-blue-600">
                        {groupRankings.find(g => g.id === userGroup.id)?.participation_rank}위
                      </div>
                      <p className="text-sm text-gray-600">활동점수 순위</p>
                      <p className="text-xs text-gray-500">
                        {groupRankings.find(g => g.id === userGroup.id)?.avg_participation_score}점 (최대 30점)
                      </p>
                    </div>
                    <div className="text-center p-4 bg-white rounded-lg border">
                      <Star className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                      <div className="text-2xl font-bold text-purple-600">
                        {groupRankings.find(g => g.id === userGroup.id)?.comprehensive_rank}위
                      </div>
                      <p className="text-sm text-gray-600">종합점수 순위</p>
                      <p className="text-xs text-gray-500">
                        {groupRankings.find(g => g.id === userGroup.id)?.comprehensive_score}점 (최대 50점)
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="comprehensive" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="comprehensive" className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>종합점수 순위</span>
            </TabsTrigger>
            <TabsTrigger value="return" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>수익률점수 순위</span>
            </TabsTrigger>
            <TabsTrigger value="participation" className="flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>활동점수 순위</span>
            </TabsTrigger>
          </TabsList>

          {/* 종합점수 순위 */}
          <TabsContent value="comprehensive" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-purple-600" />
                  <span>종합점수 순위</span>
                  <Badge variant="outline">활동점수 + 수익률점수</Badge>
                </CardTitle>
                <div className="text-sm text-gray-600">
                  <p>활동점수(최대 30점) + 수익률점수(최대 20점) = 최대 50점 (사용자 가이드 평가체계 기준)</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...groupRankings]
                    .sort((a, b) => a.comprehensive_rank - b.comprehensive_rank)
                    .map(group => renderRankingCard(group, 'comprehensive'))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 수익률 순위 */}
          <TabsContent value="return" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>수익률점수 순위</span>
                  <Badge variant="outline">수익률에 따른 점수 (최대 20점)</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...groupRankings]
                    .sort((a, b) => a.return_rank - b.return_rank)
                    .map(group => renderRankingCard(group, 'return'))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 참여도 순위 */}
          <TabsContent value="participation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  <span>활동점수 순위</span>
                  <Badge variant="outline">주간 평가 기반 활동점수</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...groupRankings]
                    .sort((a, b) => a.participation_rank - b.participation_rank)
                    .map(group => renderRankingCard(group, 'participation'))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* 계산 방식 설명 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              <span>순위 계산 방식</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-semibold text-green-800 mb-2">수익률점수 순위</h4>
                <p className="text-sm text-gray-700">팀 투자 수익률에 따른 점수 (-5%=0점, 0%=10점, +5%=20점)를 기준으로 순위를 매깁니다.</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <Activity className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-semibold text-blue-800 mb-2">활동점수 순위</h4>
                <p className="text-sm text-gray-700">참여점수(5점) + 역할수행점수(10점) + 추가활동(최대 15점) = 최대 30점을 기준으로 순위를 매깁니다.</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <Star className="h-6 w-6 text-purple-600 mb-2" />
                <h4 className="font-semibold text-purple-800 mb-2">종합점수 순위</h4>
                <p className="text-sm text-gray-700">활동점수(최대 30점) + 수익률점수(최대 20점) = 최대 50점으로 순위를 매깁니다.</p>
                <div className="mt-2 text-xs text-gray-600">
                  <p>최종점수 = 활동점수 + 수익률점수 (사용자 가이드 평가체계 기준)</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}