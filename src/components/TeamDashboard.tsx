import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Activity, 
  Award,
  Globe,
  Building,
  Crown,
  BarChart3,
  Calendar,
  Percent,
  DollarSign
} from 'lucide-react';

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

interface TeamParticipation {
  user_id: string;
  username: string;
  full_name: string;
  total_score: number;
  status: string;
  offline_meeting_score: number;
  report_writing_score: number;
  team_mentoring_score: number;
  cross_team_discussion_score: number;
  chat_contribution_score: number;
  resource_sharing_score: number;
}

interface GroupSummary {
  id: string;
  name: string;
  description: string;
  leader_name: string;
  member_count: number;
  avg_participation_score: number;
  avg_return_rate: number;
  total_allocation: number;
  portfolio_count: number;
}

interface TeamDashboardProps {
  user: User;
}

export default function TeamDashboard({ user }: TeamDashboardProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userGroup, setUserGroup] = useState<any>(null);
  const [isTeamLeader, setIsTeamLeader] = useState(false);
  const [teamPortfolio, setTeamPortfolio] = useState<TeamPortfolio[]>([]);
  const [teamParticipation, setTeamParticipation] = useState<TeamParticipation[]>([]);
  const [allGroups, setAllGroups] = useState<GroupSummary[]>([]);
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
          
          // 팀장 여부 확인
          const isLeader = membership.study_groups_2025_09_27_12_14.leader_id === profile.id;
          setIsTeamLeader(isLeader);

          // 팀 데이터 조회
          await Promise.all([
            fetchTeamPortfolio(membership.study_groups_2025_09_27_12_14.id),
            fetchTeamParticipation(membership.study_groups_2025_09_27_12_14.id),
            fetchAllGroups()
          ]);
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

  const fetchTeamParticipation = async (groupId: string) => {
    try {
      const { data } = await supabase
        .from('monthly_participation_2025_09_27_13_00')
        .select(`
          user_id,
          total_score,
          status,
          offline_meeting_score,
          report_writing_score,
          team_mentoring_score,
          cross_team_discussion_score,
          chat_contribution_score,
          resource_sharing_score,
          user_profiles_2025_09_27_12_14 (
            username,
            full_name
          )
        `)
        .eq('group_id', groupId)
        .eq('year', 2024)
        .eq('month', 9)
        .order('total_score', { ascending: false });

      const formattedData = data?.map(item => ({
        user_id: item.user_id,
        username: item.user_profiles_2025_09_27_12_14?.username || '',
        full_name: item.user_profiles_2025_09_27_12_14?.full_name || '',
        total_score: item.total_score,
        status: item.status,
        offline_meeting_score: item.offline_meeting_score,
        report_writing_score: item.report_writing_score,
        team_mentoring_score: item.team_mentoring_score,
        cross_team_discussion_score: item.cross_team_discussion_score,
        chat_contribution_score: item.chat_contribution_score,
        resource_sharing_score: item.resource_sharing_score
      })) || [];

      setTeamParticipation(formattedData);
    } catch (error) {
      console.error('팀 참여도 조회 오류:', error);
    }
  };

  const fetchAllGroups = async () => {
    try {
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

      // 각 그룹별 상세 정보 조회
      const groupSummaries = await Promise.all(
        groups.map(async (group) => {
          // 멤버 수 조회
          const { count: memberCount } = await supabase
            .from('group_memberships_2025_09_27_12_14')
            .select('*', { count: 'exact' })
            .eq('group_id', group.id);

          // 평균 참여도 조회
          const { data: participationData } = await supabase
            .from('monthly_participation_2025_09_27_13_00')
            .select('total_score')
            .eq('group_id', group.id)
            .eq('year', 2024)
            .eq('month', 9);

          const avgParticipation = participationData?.length > 0 
            ? participationData.reduce((sum, p) => sum + p.total_score, 0) / participationData.length 
            : 0;

          // 포트폴리오 정보 조회
          const { data: portfolioData } = await supabase
            .from('team_portfolios_2025_09_27_13_30')
            .select('allocation_ratio, current_return_rate')
            .eq('group_id', group.id);

          const totalAllocation = portfolioData?.reduce((sum, p) => sum + p.allocation_ratio, 0) || 0;
          const avgReturnRate = portfolioData?.length > 0 
            ? portfolioData.reduce((sum, p) => sum + p.current_return_rate, 0) / portfolioData.length 
            : 0;

          return {
            id: group.id,
            name: group.name,
            description: group.description,
            leader_name: group.user_profiles_2025_09_27_12_14?.full_name || '',
            member_count: memberCount || 0,
            avg_participation_score: Math.round(avgParticipation),
            avg_return_rate: Math.round(avgReturnRate * 10) / 10,
            total_allocation: Math.round(totalAllocation * 10) / 10,
            portfolio_count: portfolioData?.length || 0
          };
        })
      );

      setAllGroups(groupSummaries);
    } catch (error) {
      console.error('전체 그룹 조회 오류:', error);
    }
  };

  const getMarketIcon = (market: string, country: string) => {
    if (country === 'US') {
      return <Globe className="h-4 w-4 text-blue-600" />;
    }
    return <Building className="h-4 w-4 text-green-600" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <Award className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">팀 대시보드를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">팀별 투자 & 참여 현황</h1>
          <div className="flex items-center justify-center space-x-2">
            {userGroup && (
              <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
                {userGroup.name}
                {isTeamLeader && <Crown className="h-4 w-4 ml-2" />}
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="my-team" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-team">내 팀 현황</TabsTrigger>
            <TabsTrigger value="all-teams">전체 팀 비교</TabsTrigger>
          </TabsList>

          {/* 내 팀 현황 */}
          <TabsContent value="my-team" className="space-y-6">
            {/* 팀 요약 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold text-blue-600">
                    {teamParticipation.length}명
                  </div>
                  <p className="text-sm text-gray-600">팀원 수</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(teamParticipation.reduce((sum, p) => sum + p.total_score, 0) / teamParticipation.length || 0)}점
                  </div>
                  <p className="text-sm text-gray-600">평균 참여도</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <PieChart className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                  <div className="text-2xl font-bold text-purple-600">
                    {teamPortfolio.length}개
                  </div>
                  <p className="text-sm text-gray-600">포트폴리오 종목</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-red-600" />
                  <div className="text-2xl font-bold text-red-600">
                    +{Math.round((teamPortfolio.reduce((sum, p) => sum + p.current_return_rate, 0) / teamPortfolio.length || 0) * 10) / 10}%
                  </div>
                  <p className="text-sm text-gray-600">평균 수익률</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 팀 포트폴리오 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-purple-600" />
                    <span>팀 포트폴리오</span>
                    <Badge variant="outline">
                      {teamPortfolio.reduce((sum, item) => sum + item.allocation_ratio, 0).toFixed(1)}%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teamPortfolio.length > 0 ? (
                    <div className="space-y-4">
                      {teamPortfolio.map((item) => (
                        <div key={item.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {getMarketIcon(item.market, item.country)}
                              <div>
                                <h4 className="font-semibold text-sm">{item.stock_symbol}</h4>
                                <p className="text-xs text-gray-600">{item.stock_name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-blue-600">{item.allocation_ratio}%</div>
                              <div className={`text-xs ${item.current_return_rate >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                {item.current_return_rate >= 0 ? '+' : ''}{item.current_return_rate}%
                              </div>
                            </div>
                          </div>
                          <Progress 
                            value={Math.min((item.current_return_rate / item.target_return_rate) * 100, 100)} 
                            className="h-1" 
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            목표: +{item.target_return_rate}%
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <PieChart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">포트폴리오가 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 팀 참여도 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-green-600" />
                    <span>팀 참여도 (9월)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {teamParticipation.length > 0 ? (
                    <div className="space-y-4">
                      {teamParticipation.map((member, index) => (
                        <div key={member.user_id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                index === 0 ? 'bg-yellow-100 text-yellow-800' : 
                                index === 1 ? 'bg-gray-100 text-gray-800' : 
                                index === 2 ? 'bg-orange-100 text-orange-800' : 
                                'bg-blue-100 text-blue-800'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm">{member.full_name}</h4>
                                <p className="text-xs text-gray-600">@{member.username}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                {getStatusIcon(member.status)}
                                <Badge className={`text-xs ${getStatusColor(member.status)}`}>
                                  {member.status === 'approved' ? '승인' : 
                                   member.status === 'rejected' ? '반려' : '대기'}
                                </Badge>
                              </div>
                              <div className="font-bold text-green-600 mt-1">{member.total_score}점</div>
                            </div>
                          </div>
                          <Progress value={(member.total_score / 85) * 100} className="h-1" />
                          <div className="grid grid-cols-3 gap-2 mt-2 text-xs">
                            <div className="text-center">
                              <div className="text-gray-600">모임</div>
                              <div className="font-semibold">{member.offline_meeting_score}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-600">멘토링</div>
                              <div className="font-semibold">{member.team_mentoring_score}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-600">톡방</div>
                              <div className="font-semibold">{member.chat_contribution_score}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">참여도 데이터가 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 전체 팀 비교 */}
          <TabsContent value="all-teams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span>전체 팀 비교</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {allGroups.map((group) => (
                    <div key={group.id} className={`p-4 border rounded-lg ${group.id === userGroup?.id ? 'border-blue-500 bg-blue-50' : ''}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-lg">{group.name}</h3>
                          {group.id === userGroup?.id && <Badge className="bg-blue-100 text-blue-800">내 팀</Badge>}
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-600">팀장</div>
                          <div className="font-semibold">{group.leader_name}</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                          <div className="font-bold text-blue-600">{group.member_count}명</div>
                          <div className="text-xs text-gray-600">팀원</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded">
                          <PieChart className="h-5 w-5 mx-auto mb-1 text-purple-600" />
                          <div className="font-bold text-purple-600">{group.portfolio_count}개</div>
                          <div className="text-xs text-gray-600">종목</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>평균 참여도</span>
                            <span className="font-semibold">{group.avg_participation_score}점</span>
                          </div>
                          <Progress value={(group.avg_participation_score / 85) * 100} className="h-2" />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>평균 수익률</span>
                            <span className={`font-semibold ${group.avg_return_rate >= 0 ? 'text-red-600' : 'text-blue-600'}`}>
                              {group.avg_return_rate >= 0 ? '+' : ''}{group.avg_return_rate}%
                            </span>
                          </div>
                          <Progress 
                            value={Math.min(Math.max((group.avg_return_rate + 20) * 2.5, 0), 100)} 
                            className="h-2" 
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>포트폴리오 배분</span>
                            <span className="font-semibold">{group.total_allocation}%</span>
                          </div>
                          <Progress value={group.total_allocation} className="h-2" />
                        </div>
                      </div>

                      {group.description && (
                        <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          {group.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}