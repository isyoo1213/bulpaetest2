import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  TrendingUp, 
  MessageCircle, 
  PlusCircle, 
  Calendar,
  BarChart3,
  Users,
  Target
} from 'lucide-react';

interface ParticipationData {
  user_id: string;
  full_name: string;
  username: string;
  total_activities: number;
  investment_records: number;
  ideas_shared: number;
  comments_written: number;
  participation_score: number;
  last_activity: string;
  weekly_activities: number;
  monthly_activities: number;
}

interface GroupParticipationData {
  group_id: string;
  group_name: string;
  total_members: number;
  active_members: number;
  total_activities: number;
  avg_participation: number;
  members: ParticipationData[];
}

interface ParticipationProps {
  user: User;
}

export default function Participation({ user }: ParticipationProps) {
  const [participationData, setParticipationData] = useState<GroupParticipationData[]>([]);
  const [userParticipation, setUserParticipation] = useState<ParticipationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'all'>('week');

  useEffect(() => {
    fetchParticipationData();
  }, [user]);

  const fetchParticipationData = async () => {
    try {
      // 현재 사용자 프로필 조회
      const { data: currentProfile } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!currentProfile) return;

      // 사용자가 속한 그룹들 조회
      const { data: userGroups } = await supabase
        .from('group_memberships_2025_09_27_12_14')
        .select(`
          group_id,
          study_groups_2025_09_27_12_14 (
            id,
            name,
            current_members
          )
        `)
        .eq('user_id', currentProfile.id);

      const groupParticipationData: GroupParticipationData[] = [];

      for (const userGroup of userGroups || []) {
        const group = userGroup.study_groups_2025_09_27_12_14;
        if (!group) continue;

        // 그룹 멤버들의 참여도 데이터 조회
        const { data: groupMembers } = await supabase
          .from('group_memberships_2025_09_27_12_14')
          .select(`
            user_profiles_2025_09_27_12_14 (
              id,
              user_id,
              username,
              full_name,
              participation_score
            )
          `)
          .eq('group_id', group.id);

        const membersParticipation: ParticipationData[] = [];

        for (const member of groupMembers || []) {
          const profile = member.user_profiles_2025_09_27_12_14;
          if (!profile) continue;

          // 투자 기록 수 조회
          const { count: investmentCount } = await supabase
            .from('investment_records_2025_09_27_12_14')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          // 아이디어 공유 수 조회
          const { count: ideasCount } = await supabase
            .from('investment_ideas_2025_09_27_12_14')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          // 댓글 수 조회
          const { count: commentsCount } = await supabase
            .from('comments_2025_09_27_12_14')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          // 최근 활동 조회
          const { data: recentActivity } = await supabase
            .from('participation_logs_2025_09_27_12_14')
            .select('created_at')
            .eq('user_id', profile.id)
            .order('created_at', { ascending: false })
            .limit(1);

          // 주간 활동 수 조회 (최근 7일)
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          
          const { count: weeklyCount } = await supabase
            .from('participation_logs_2025_09_27_12_14')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)
            .gte('created_at', weekAgo.toISOString());

          // 월간 활동 수 조회 (최근 30일)
          const monthAgo = new Date();
          monthAgo.setDate(monthAgo.getDate() - 30);
          
          const { count: monthlyCount } = await supabase
            .from('participation_logs_2025_09_27_12_14')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id)
            .gte('created_at', monthAgo.toISOString());

          const totalActivities = (investmentCount || 0) + (ideasCount || 0) + (commentsCount || 0);

          const memberParticipation: ParticipationData = {
            user_id: profile.user_id,
            full_name: profile.full_name,
            username: profile.username,
            total_activities: totalActivities,
            investment_records: investmentCount || 0,
            ideas_shared: ideasCount || 0,
            comments_written: commentsCount || 0,
            participation_score: profile.participation_score,
            last_activity: recentActivity?.[0]?.created_at || '',
            weekly_activities: weeklyCount || 0,
            monthly_activities: monthlyCount || 0
          };

          membersParticipation.push(memberParticipation);

          // 현재 사용자 데이터 저장
          if (profile.user_id === user.id) {
            setUserParticipation(memberParticipation);
          }
        }

        // 그룹별 통계 계산
        const totalActivities = membersParticipation.reduce((sum, m) => sum + m.total_activities, 0);
        const avgParticipation = membersParticipation.length > 0 
          ? membersParticipation.reduce((sum, m) => sum + m.participation_score, 0) / membersParticipation.length 
          : 0;
        
        const activeMembers = membersParticipation.filter(m => {
          const lastActivity = new Date(m.last_activity);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return lastActivity > weekAgo;
        }).length;

        groupParticipationData.push({
          group_id: group.id,
          group_name: group.name,
          total_members: group.current_members,
          active_members: activeMembers,
          total_activities: totalActivities,
          avg_participation: avgParticipation,
          members: membersParticipation.sort((a, b) => b.participation_score - a.participation_score)
        });
      }

      setParticipationData(groupParticipationData);

    } catch (error) {
      console.error('참여도 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityValue = (member: ParticipationData) => {
    switch (selectedPeriod) {
      case 'week':
        return member.weekly_activities;
      case 'month':
        return member.monthly_activities;
      default:
        return member.total_activities;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '활동 없음';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return '오늘';
    if (diffDays === 2) return '어제';
    if (diffDays <= 7) return `${diffDays - 1}일 전`;
    return date.toLocaleDateString('ko-KR');
  };

  const getActivityColor = (activities: number, maxActivities: number) => {
    const ratio = maxActivities > 0 ? activities / maxActivities : 0;
    if (ratio >= 0.8) return 'bg-green-500';
    if (ratio >= 0.6) return 'bg-blue-500';
    if (ratio >= 0.4) return 'bg-yellow-500';
    if (ratio >= 0.2) return 'bg-orange-500';
    return 'bg-gray-300';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">참여도 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">참여도 대시보드</h1>
          <p className="text-gray-600">그룹별 참여도와 활동 현황을 확인하세요</p>
        </div>

        {/* 기간 선택 */}
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => setSelectedPeriod('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'week'
                ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            주간
          </button>
          <button
            onClick={() => setSelectedPeriod('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'month'
                ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            월간
          </button>
          <button
            onClick={() => setSelectedPeriod('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedPeriod === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            전체
          </button>
        </div>

        {/* 내 참여도 요약 */}
        {userParticipation && (
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span>나의 참여도</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {userParticipation.participation_score.toLocaleString()}
                  </div>
                  <p className="text-sm text-gray-600">총 참여점수</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {getActivityValue(userParticipation)}
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedPeriod === 'week' ? '주간' : selectedPeriod === 'month' ? '월간' : '총'} 활동
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {userParticipation.investment_records}
                  </div>
                  <p className="text-sm text-gray-600">투자 기록</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {userParticipation.ideas_shared}
                  </div>
                  <p className="text-sm text-gray-600">아이디어 공유</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 그룹별 참여도 */}
        <div className="space-y-6">
          {participationData.map((groupData) => {
            const maxActivities = Math.max(...groupData.members.map(m => getActivityValue(m)));
            
            return (
              <Card key={groupData.group_id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-600" />
                      <span>{groupData.group_name}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Activity className="h-4 w-4" />
                        <span>활성 멤버: {groupData.active_members}/{groupData.total_members}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <BarChart3 className="h-4 w-4" />
                        <span>평균 참여점수: {groupData.avg_participation.toFixed(0)}</span>
                      </div>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* 그룹 활동 현황 */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span>그룹 활동률</span>
                      <span>{((groupData.active_members / groupData.total_members) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(groupData.active_members / groupData.total_members) * 100} />
                  </div>

                  {/* 멤버별 참여도 */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-700">멤버별 참여도</h4>
                    {groupData.members.map((member, index) => {
                      const isCurrentUser = member.user_id === user.id;
                      const activityValue = getActivityValue(member);
                      
                      return (
                        <div 
                          key={member.user_id}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium text-gray-500">
                              #{index + 1}
                            </div>
                            <div>
                              <h5 className="font-medium flex items-center space-x-2">
                                <span>{member.full_name}</span>
                                {isCurrentUser && (
                                  <Badge variant="secondary" className="text-xs">나</Badge>
                                )}
                              </h5>
                              <p className="text-sm text-gray-600">@{member.username}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            {/* 활동 히트맵 */}
                            <div className="flex items-center space-x-1">
                              <div 
                                className={`w-3 h-3 rounded ${getActivityColor(activityValue, maxActivities)}`}
                                title={`${activityValue}개 활동`}
                              />
                              <span className="text-sm font-medium">{activityValue}</span>
                            </div>
                            
                            {/* 상세 활동 */}
                            <div className="flex items-center space-x-3 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <TrendingUp className="h-3 w-3" />
                                <span>{member.investment_records}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <PlusCircle className="h-3 w-3" />
                                <span>{member.ideas_shared}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <MessageCircle className="h-3 w-3" />
                                <span>{member.comments_written}</span>
                              </div>
                            </div>
                            
                            {/* 참여점수 */}
                            <div className="text-right">
                              <div className="text-sm font-bold text-purple-600">
                                {member.participation_score.toLocaleString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(member.last_activity)}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {participationData.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">참여도 데이터가 없습니다</h3>
              <p className="text-gray-600">스터디 그룹에 가입하여 활동을 시작해보세요!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}