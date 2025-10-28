import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  TrendingUp, 
  Activity, 
  FileText, 
  RotateCw,
  Crown,
  Search,
  BarChart3,
  Target,
  Shield,
  Edit,
  Info,
  Calendar,
  Award
} from 'lucide-react';

interface Role {
  id: string;
  role_name: string;
  role_key: string;
  description: string;
  responsibilities: string;
  is_rotating: boolean;
  sort_order: number;
}

interface WeeklyEvaluation {
  id: string;
  group_id: string;
  week_number: number;
  year: number;
  start_asset: number | null;
  end_asset: number | null;
  net_flow: number;
  team_return_rate: number | null;
  team_return_score: number | null;
  status: string;
}

interface MemberScore {
  id: string;
  member_id: string;
  assigned_role: string;
  participated: boolean;
  role_completed: boolean;
  participation_score: number;
  role_score: number;
  activity_score: number;
  return_score: number;
  final_score: number;
  comment: string;
  member_name: string;
}

interface RoleOpinion {
  role_key: string;
  opinion_text: string;
}

interface NewEvaluationSystemProps {
  user: User;
}

export default function NewEvaluationSystem({ user }: NewEvaluationSystemProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userGroup, setUserGroup] = useState<any>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [currentYear] = useState(new Date().getFullYear());
  const [weeklyEvaluation, setWeeklyEvaluation] = useState<WeeklyEvaluation | null>(null);
  const [memberScores, setMemberScores] = useState<MemberScore[]>([]);
  const [roleOpinions, setRoleOpinions] = useState<RoleOpinion[]>([]);
  const [teamSettings, setTeamSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (userGroup) {
      fetchWeeklyData();
    }
  }, [currentWeek, userGroup]);

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

        // 역할 정의 조회
        const { data: rolesData } = await supabase
          .from('role_definitions_2025_10_20_08_10')
          .select('*')
          .order('sort_order');

        if (rolesData) {
          setRoles(rolesData);
        }
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

  const fetchWeeklyData = async () => {
    if (!userGroup) return;

    try {
      // 주간 평가 데이터 조회
      let { data: evaluation } = await supabase
        .from('weekly_evaluations_2025_10_20_08_10')
        .select('*')
        .eq('group_id', userGroup.id)
        .eq('week_number', currentWeek)
        .eq('year', currentYear)
        .single();

      // 평가 데이터가 없으면 생성
      if (!evaluation) {
        const { data: newEvaluation, error } = await supabase
          .from('weekly_evaluations_2025_10_20_08_10')
          .insert({
            group_id: userGroup.id,
            week_number: currentWeek,
            year: currentYear,
            status: 'draft'
          })
          .select()
          .single();

        if (error) throw error;
        evaluation = newEvaluation;
      }

      setWeeklyEvaluation(evaluation);

      // 멤버 점수 조회
      const { data: scoresData } = await supabase
        .from('member_weekly_scores_2025_10_20_08_10')
        .select(`
          *,
          user_profiles_2025_09_27_12_14 (full_name)
        `)
        .eq('evaluation_id', evaluation.id);

      if (scoresData) {
        const formattedScores = scoresData.map(score => ({
          ...score,
          member_name: score.user_profiles_2025_09_27_12_14?.full_name || '익명'
        }));
        setMemberScores(formattedScores);
      } else {
        // 멤버 점수 데이터가 없으면 초기화
        await initializeMemberScores(evaluation.id);
      }

      // 역할별 의견 조회
      const { data: opinionsData } = await supabase
        .from('role_opinions_2025_10_20_08_10')
        .select('*')
        .eq('evaluation_id', evaluation.id);

      if (opinionsData) {
        setRoleOpinions(opinionsData);
      }

      // 팀 설정 조회
      const { data: settings } = await supabase
        .from('team_settings_2025_10_20_08_10')
        .select('*')
        .eq('group_id', userGroup.id)
        .single();

      if (settings) {
        setTeamSettings(settings);
      }

    } catch (error) {
      console.error('주간 데이터 조회 오류:', error);
    }
  };

  const initializeMemberScores = async (evaluationId: string) => {
    if (!userGroup) return;

    try {
      // 그룹 멤버 조회
      const { data: members } = await supabase
        .from('group_memberships_2025_09_27_12_14')
        .select(`
          user_id,
          user_profiles_2025_09_27_12_14 (id, full_name)
        `)
        .eq('group_id', userGroup.id);

      if (members) {
        const memberScoresData = members.map((member, index) => ({
          evaluation_id: evaluationId,
          member_id: member.user_profiles_2025_09_27_12_14.id,
          assigned_role: calculateRole(index, currentWeek),
          participated: false,
          role_completed: false
        }));

        const { error } = await supabase
          .from('member_weekly_scores_2025_10_20_08_10')
          .insert(memberScoresData);

        if (error) throw error;

        // 다시 조회
        await fetchWeeklyData();
      }
    } catch (error) {
      console.error('멤버 점수 초기화 오류:', error);
    }
  };

  const calculateRole = (memberIndex: number, weekNumber: number): string => {
    const allRoles = ['strategy_leader', 'researcher', 'analyzer', 'risk_checker', 'recorder'];
    const cycle = Math.floor(weekNumber / 2); // 2주마다 순환
    
    // 5개 역할 순환 (각 팀당 5명)
    const roleIndex = (memberIndex + cycle) % allRoles.length;
    return allRoles[roleIndex];
  };

  const updateWeeklyEvaluation = async (updates: Partial<WeeklyEvaluation>) => {
    if (!weeklyEvaluation) return;

    try {
      const { error } = await supabase
        .from('weekly_evaluations_2025_10_20_08_10')
        .update(updates)
        .eq('id', weeklyEvaluation.id);

      if (error) throw error;

      setWeeklyEvaluation(prev => prev ? { ...prev, ...updates } : null);
      
      toast({
        title: "저장 완료",
        description: "평가 데이터가 저장되었습니다.",
      });

    } catch (error) {
      console.error('평가 업데이트 오류:', error);
      toast({
        title: "저장 실패",
        description: "데이터 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const updateMemberScore = async (memberId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('member_weekly_scores_2025_10_20_08_10')
        .update(updates)
        .eq('evaluation_id', weeklyEvaluation?.id)
        .eq('member_id', memberId);

      if (error) throw error;

      // 로컬 상태 업데이트
      setMemberScores(prev => 
        prev.map(score => 
          score.member_id === memberId 
            ? { ...score, ...updates }
            : score
        )
      );

    } catch (error) {
      console.error('멤버 점수 업데이트 오류:', error);
      toast({
        title: "저장 실패",
        description: "점수 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const updateRoleOpinion = async (roleKey: string, opinionText: string) => {
    if (!weeklyEvaluation || !userProfile) return;

    try {
      const { error } = await supabase
        .from('role_opinions_2025_10_20_08_10')
        .upsert({
          evaluation_id: weeklyEvaluation.id,
          role_key: roleKey,
          opinion_text: opinionText,
          author_id: userProfile.id
        });

      if (error) throw error;

      setRoleOpinions(prev => {
        const existing = prev.find(op => op.role_key === roleKey);
        if (existing) {
          return prev.map(op => 
            op.role_key === roleKey 
              ? { ...op, opinion_text: opinionText }
              : op
          );
        } else {
          return [...prev, { role_key: roleKey, opinion_text: opinionText }];
        }
      });

    } catch (error) {
      console.error('의견 업데이트 오류:', error);
    }
  };

  const getRoleIcon = (roleKey: string) => {
    const icons: { [key: string]: any } = {
      strategy_leader: Crown,
      researcher: Search,
      analyzer: BarChart3,
      risk_checker: Shield,
      recorder: Edit
    };
    return icons[roleKey] || FileText;
  };

  const getRoleName = (roleKey: string) => {
    const role = roles.find(r => r.role_key === roleKey);
    return role?.role_name || roleKey;
  };

  const getRoleDescription = (roleKey: string) => {
    const role = roles.find(r => r.role_key === roleKey);
    return role?.responsibilities || '';
  };

  const getNextWeekRoles = () => {
    return memberScores.map((score, index) => ({
      ...score,
      next_role: calculateRole(index, currentWeek + 1)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">새로운 평가시스템을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!userGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            그룹에 소속되어 있지 않습니다. 관리자에게 문의하세요.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">새로운 평가시스템</h1>
          <p className="text-gray-600">주간 입력 · 2주 역할 순환 · 자동 점수 계산</p>
        </div>

        {/* 주차 선택 */}
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Label className="text-sm font-medium">주차 선택</Label>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-2 bg-blue-100 rounded-lg font-bold text-blue-800">
                {currentWeek + 1}주차
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setCurrentWeek(currentWeek + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="text-sm text-gray-600">
              {userGroup.name} · {currentYear}년
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="evaluation" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="evaluation">주간 평가</TabsTrigger>
            <TabsTrigger value="roles">역할 현황</TabsTrigger>
            <TabsTrigger value="opinions">역할별 의견</TabsTrigger>
            <TabsTrigger value="report">주간 보고서</TabsTrigger>
          </TabsList>

          {/* 주간 평가 탭 */}
          <TabsContent value="evaluation" className="space-y-6">
            {/* 팀 자산 입력 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>팀 자산 입력 (기록·입력 담당자)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label>시작 자산</Label>
                    <Input
                      type="number"
                      placeholder="예: 10000000"
                      value={weeklyEvaluation?.start_asset || ''}
                      onChange={(e) => updateWeeklyEvaluation({
                        start_asset: e.target.value ? Number(e.target.value) : null
                      })}
                    />
                  </div>
                  <div>
                    <Label>종료 자산</Label>
                    <Input
                      type="number"
                      placeholder="예: 10500000"
                      value={weeklyEvaluation?.end_asset || ''}
                      onChange={(e) => updateWeeklyEvaluation({
                        end_asset: e.target.value ? Number(e.target.value) : null
                      })}
                    />
                  </div>
                  <div>
                    <Label>순입출금</Label>
                    <Input
                      type="number"
                      placeholder="예: 100000"
                      value={weeklyEvaluation?.net_flow || 0}
                      onChange={(e) => updateWeeklyEvaluation({
                        net_flow: Number(e.target.value) || 0
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-gray-600">계산된 수익률</div>
                    <div className="text-2xl font-bold text-green-600">
                      {weeklyEvaluation?.team_return_rate?.toFixed(2) || '0.00'}%
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600">수익률 점수</div>
                    <div className="text-2xl font-bold text-blue-600">
                      {weeklyEvaluation?.team_return_score?.toFixed(1) || '0.0'}점
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 멤버별 평가 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>멤버별 평가</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">멤버</th>
                        <th className="text-left p-2">역할</th>
                        <th className="text-left p-2">참여</th>
                        <th className="text-left p-2">역할수행</th>
                        <th className="text-left p-2">활동점수</th>
                        <th className="text-left p-2">수익률점수</th>
                        <th className="text-left p-2">최종점수</th>
                        <th className="text-left p-2">코멘트</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberScores.map((score) => {
                        const RoleIcon = getRoleIcon(score.assigned_role);
                        return (
                          <tr key={score.id} className="border-b">
                            <td className="p-2 font-medium">{score.member_name}</td>
                            <td className="p-2">
                              <div className="flex items-center space-x-2">
                                <RoleIcon className="h-4 w-4" />
                                <span>{getRoleName(score.assigned_role)}</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <Checkbox
                                checked={score.participated}
                                onCheckedChange={(checked) => 
                                  updateMemberScore(score.member_id, { participated: checked })
                                }
                              />
                            </td>
                            <td className="p-2">
                              <Checkbox
                                checked={score.role_completed}
                                onCheckedChange={(checked) => 
                                  updateMemberScore(score.member_id, { role_completed: checked })
                                }
                              />
                            </td>
                            <td className="p-2">
                              <Badge variant="outline">{score.activity_score}점</Badge>
                            </td>
                            <td className="p-2">
                              <Badge variant="outline">{score.return_score}점</Badge>
                            </td>
                            <td className="p-2">
                              <Badge className="bg-blue-100 text-blue-800">
                                {score.final_score}점
                              </Badge>
                            </td>
                            <td className="p-2">
                              <Input
                                placeholder="코멘트"
                                value={score.comment || ''}
                                onChange={(e) => 
                                  updateMemberScore(score.member_id, { comment: e.target.value })
                                }
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 역할 현황 탭 */}
          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 이번 주 역할 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>이번 주 역할 ({currentWeek + 1}주차)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {memberScores.map((score) => {
                      const RoleIcon = getRoleIcon(score.assigned_role);
                      return (
                        <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <RoleIcon className="h-5 w-5" />
                            <div>
                              <div className="font-medium">{score.member_name}</div>
                              <div className="text-sm text-gray-600">{getRoleName(score.assigned_role)}</div>
                            </div>
                          </div>
                          <Badge variant={score.role_completed ? "default" : "outline"}>
                            {score.role_completed ? "완료" : "진행중"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* 다음 주 역할 미리보기 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <RotateCw className="h-5 w-5" />
                    <span>다음 주 역할 ({currentWeek + 2}주차)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getNextWeekRoles().map((score) => {
                      const RoleIcon = getRoleIcon(score.next_role);
                      return (
                        <div key={score.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <RoleIcon className="h-5 w-5" />
                            <div>
                              <div className="font-medium">{score.member_name}</div>
                              <div className="text-sm text-gray-600">{getRoleName(score.next_role)}</div>
                            </div>
                          </div>
                          <Badge variant="secondary">예정</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 역할 설명 */}
            <Card>
              <CardHeader>
                <CardTitle>역할별 상세 설명</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roles.map((role) => {
                    const RoleIcon = getRoleIcon(role.role_key);
                    return (
                      <div key={role.id} className="p-4 border rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <RoleIcon className="h-5 w-5" />
                          <h4 className="font-semibold">{role.role_name}</h4>
                          {!role.is_rotating && (
                            <Badge variant="outline">고정</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{role.description}</p>
                        <p className="text-xs text-gray-500">{role.responsibilities}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 역할별 의견 탭 */}
          <TabsContent value="opinions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>역할별 의견 작성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {roles.map((role) => {
                    const RoleIcon = getRoleIcon(role.role_key);
                    const opinion = roleOpinions.find(op => op.role_key === role.role_key);
                    
                    return (
                      <div key={role.id} className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <RoleIcon className="h-5 w-5" />
                          <h4 className="font-semibold">{role.role_name}</h4>
                        </div>
                        <p className="text-sm text-gray-600">{role.responsibilities}</p>
                        <Textarea
                          placeholder={`${role.role_name} 관점에서 이번 주 의견을 작성해주세요`}
                          value={opinion?.opinion_text || ''}
                          onChange={(e) => updateRoleOpinion(role.role_key, e.target.value)}
                          rows={4}
                        />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 주간 보고서 탭 */}
          <TabsContent value="report" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>주간 보고서</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold mb-2">기본 정보</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>팀: {userGroup.name}</div>
                      <div>주차: {currentWeek + 1}주차</div>
                      <div>수익률: {weeklyEvaluation?.team_return_rate?.toFixed(2) || '0.00'}%</div>
                      <div>팀 평균 점수: {(memberScores.reduce((sum, score) => sum + score.final_score, 0) / memberScores.length || 0).toFixed(1)}점</div>
                    </div>
                  </div>

                  {/* 역할별 의견 */}
                  <div>
                    <h4 className="font-semibold mb-4">역할별 의견</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {roles.map((role) => {
                        const RoleIcon = getRoleIcon(role.role_key);
                        const opinion = roleOpinions.find(op => op.role_key === role.role_key);
                        
                        return (
                          <div key={role.id} className="p-4 border rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                              <RoleIcon className="h-4 w-4" />
                              <h5 className="font-medium">{role.role_name}</h5>
                            </div>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {opinion?.opinion_text || '(작성된 의견이 없습니다)'}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 멤버 요약 */}
                  <div>
                    <h4 className="font-semibold mb-4">멤버 요약</h4>
                    <div className="space-y-2">
                      {memberScores.map((score) => (
                        <div key={score.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="font-medium">{score.member_name}</div>
                            <Badge variant="outline">{getRoleName(score.assigned_role)}</Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={score.participated ? "default" : "secondary"}>
                              참여: {score.participated ? "✅" : "❌"}
                            </Badge>
                            <Badge variant={score.role_completed ? "default" : "secondary"}>
                              역할: {score.role_completed ? "✅" : "❌"}
                            </Badge>
                            <Badge className="bg-blue-100 text-blue-800">
                              {score.final_score}점
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button onClick={() => window.print()}>
                      <FileText className="h-4 w-4 mr-2" />
                      PDF 저장 / 인쇄
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}