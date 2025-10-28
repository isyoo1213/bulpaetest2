import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { 
  Settings, 
  Users, 
  Shield, 
  BarChart3, 
  Palette, 
  RotateCw,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Crown,
  Search,
  Target,
  FileText,
  Image,
  Coins,
  Award,
  Bell,
  Database,
  Activity,
  TrendingUp
} from 'lucide-react';

interface SystemSettings {
  features_enabled: {
    point_system: boolean;
    report_marketplace: boolean;
    badge_system: boolean;
    reward_system: boolean;
  };
  evaluation_settings: {
    participation_score: number;
    role_score: number;
    activity_cap: number;
    return_score_max: number;
    final_score_max: number;
  };
  rotation_settings: {
    rotation_cycle_weeks: number;
    roles_per_cycle: number;
  };
}

interface TeamData {
  id: string;
  name: string;
  description: string;
  leader_name: string;
  member_count: number;
  team_color: string;
  team_slogan: string;
  team_goal: string;
  fixed_recorder_name: string;
}

interface UserData {
  id: string;
  full_name: string;
  username: string;
  email: string;
  team_name: string;
  current_points: number;
  total_earned: number;
  total_spent: number;
}

interface AdminPanelProps {
  user: User;
}

export default function AdminPanel({ user }: AdminPanelProps) {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [systemSettings, setSystemSettings] = useState<SystemSettings | null>(null);
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<TeamData | null>(null);
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');

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
          fetchSystemSettings(),
          fetchTeams(),
          fetchUsers()
        ]);
      }

    } catch (error) {
      console.error('초기 데이터 조회 오류:', error);
      toast({
        title: "오류",
        description: "관리자 데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const { data } = await supabase
        .from('system_settings_2025_10_20_08_10')
        .select('*');

      if (data) {
        const settings: SystemSettings = {
          features_enabled: { point_system: false, report_marketplace: false, badge_system: false, reward_system: false },
          evaluation_settings: { participation_score: 5, role_score: 10, activity_cap: 30, return_score_max: 20, final_score_max: 50 },
          rotation_settings: { rotation_cycle_weeks: 2, roles_per_cycle: 4 }
        };

        data.forEach(setting => {
          if (setting.setting_key === 'features_enabled') {
            settings.features_enabled = setting.setting_value;
          } else if (setting.setting_key === 'evaluation_settings') {
            settings.evaluation_settings = setting.setting_value;
          } else if (setting.setting_key === 'rotation_settings') {
            settings.rotation_settings = setting.setting_value;
          }
        });

        setSystemSettings(settings);
      }
    } catch (error) {
      console.error('시스템 설정 조회 오류:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const { data } = await supabase
        .from('study_groups_2025_09_27_12_14')
        .select(`
          id,
          name,
          description,
          user_profiles_2025_09_27_12_14!study_groups_2025_09_27_12_14_leader_id_fkey (full_name),
          team_settings_2025_10_20_08_10 (
            team_color,
            team_slogan,
            team_goal,
            fixed_recorder_id,
            user_profiles_2025_09_27_12_14!team_settings_2025_10_20_08_10_fixed_recorder_id_fkey (full_name)
          )
        `);

      if (data) {
        const teamsData = await Promise.all(
          data.map(async (team) => {
            // 멤버 수 조회
            const { count } = await supabase
              .from('group_memberships_2025_09_27_12_14')
              .select('*', { count: 'exact' })
              .eq('group_id', team.id);

            return {
              id: team.id,
              name: team.name,
              description: team.description || '',
              leader_name: team.user_profiles_2025_09_27_12_14?.full_name || '미지정',
              member_count: count || 0,
              team_color: team.team_settings_2025_10_20_08_10?.team_color || '#3B82F6',
              team_slogan: team.team_settings_2025_10_20_08_10?.team_slogan || '',
              team_goal: team.team_settings_2025_10_20_08_10?.team_goal || '',
              fixed_recorder_name: team.team_settings_2025_10_20_08_10?.user_profiles_2025_09_27_12_14?.full_name || '미지정'
            };
          })
        );

        setTeams(teamsData);
      }
    } catch (error) {
      console.error('팀 데이터 조회 오류:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select(`
          id,
          full_name,
          username,
          user_id,
          group_memberships_2025_09_27_12_14 (
            study_groups_2025_09_27_12_14 (name)
          ),
          user_points_2025_09_28_06_00 (
            current_points,
            total_earned,
            total_spent
          )
        `);

      if (data) {
        const usersData = await Promise.all(
          data.map(async (user) => {
            // 이메일 조회 (auth.users에서)
            const { data: authUser } = await supabase.auth.admin.getUserById(user.user_id);
            
            return {
              id: user.id,
              full_name: user.full_name,
              username: user.username,
              email: authUser.user?.email || '미지정',
              team_name: user.group_memberships_2025_09_27_12_14?.[0]?.study_groups_2025_09_27_12_14?.name || '미배정',
              current_points: user.user_points_2025_09_28_06_00?.current_points || 0,
              total_earned: user.user_points_2025_09_28_06_00?.total_earned || 0,
              total_spent: user.user_points_2025_09_28_06_00?.total_spent || 0
            };
          })
        );

        setUsers(usersData);
      }
    } catch (error) {
      console.error('사용자 데이터 조회 오류:', error);
    }
  };

  const updateSystemSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('system_settings_2025_10_20_08_10')
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq('setting_key', key);

      if (error) throw error;

      setSystemSettings(prev => prev ? { ...prev, [key]: value } : null);

      toast({
        title: "설정 저장 완료",
        description: "시스템 설정이 업데이트되었습니다.",
      });

    } catch (error) {
      console.error('설정 업데이트 오류:', error);
      toast({
        title: "설정 저장 실패",
        description: "설정 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const generateTeamImage = async (teamId: string, teamName: string) => {
    try {
      setLoading(true);
      
      // AI 이미지 생성 (실제로는 이미지 생성 API 호출)
      const imagePrompt = `Professional team logo for investment study group named "${teamName}". Modern, clean design with financial theme. Blue and green color scheme. Minimalist style.`;
      
      // 임시로 placeholder 이미지 URL 사용
      const imageUrl = `https://via.placeholder.com/200x200/3B82F6/FFFFFF?text=${encodeURIComponent(teamName)}`;
      
      // 팀 설정 업데이트
      const { error } = await supabase
        .from('team_settings_2025_10_20_08_10')
        .update({ team_image_url: imageUrl })
        .eq('group_id', teamId);

      if (error) throw error;

      toast({
        title: "팀 이미지 생성 완료",
        description: `${teamName} 팀의 이미지가 생성되었습니다.`,
      });

      await fetchTeams();

    } catch (error) {
      console.error('팀 이미지 생성 오류:', error);
      toast({
        title: "이미지 생성 실패",
        description: "팀 이미지 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateTeamSettings = async (teamId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('team_settings_2025_10_20_08_10')
        .upsert({
          group_id: teamId,
          ...updates,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "팀 설정 저장 완료",
        description: "팀 설정이 업데이트되었습니다.",
      });

      await fetchTeams();

    } catch (error) {
      console.error('팀 설정 업데이트 오류:', error);
      toast({
        title: "설정 저장 실패",
        description: "팀 설정 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const createNewTeam = async () => {
    if (!newTeamName.trim()) {
      toast({
        title: "입력 오류",
        description: "팀 이름을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      // 새 팀 생성
      const { data: newTeam, error: teamError } = await supabase
        .from('study_groups_2025_09_27_12_14')
        .insert({
          name: newTeamName,
          description: newTeamDescription,
          leader_id: userProfile.id
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // 팀 설정 초기화
      const { error: settingsError } = await supabase
        .from('team_settings_2025_10_20_08_10')
        .insert({
          group_id: newTeam.id,
          team_color: '#3B82F6',
          team_slogan: '함께 성장하는 투자 스터디'
        });

      if (settingsError) throw settingsError;

      toast({
        title: "팀 생성 완료",
        description: `${newTeamName} 팀이 생성되었습니다.`,
      });

      setNewTeamName('');
      setNewTeamDescription('');
      setShowTeamDialog(false);
      await fetchTeams();

    } catch (error) {
      console.error('팀 생성 오류:', error);
      toast({
        title: "팀 생성 실패",
        description: "팀 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const adjustUserPoints = async (userId: string, amount: number, description: string) => {
    try {
      // 포인트 조정
      const { error: pointsError } = await supabase
        .from('user_points_2025_09_28_06_00')
        .update({
          current_points: supabase.sql`current_points + ${amount}`,
          total_earned: amount > 0 ? supabase.sql`total_earned + ${amount}` : supabase.sql`total_earned`,
          total_spent: amount < 0 ? supabase.sql`total_spent + ${Math.abs(amount)}` : supabase.sql`total_spent`
        })
        .eq('user_id', userId);

      if (pointsError) throw pointsError;

      // 거래 기록 추가
      const { error: transactionError } = await supabase
        .from('point_transactions_2025_09_28_06_00')
        .insert({
          user_id: userId,
          transaction_type: amount > 0 ? 'earn' : 'spend',
          amount: amount,
          description: description,
          reference_type: 'admin_adjustment'
        });

      if (transactionError) throw transactionError;

      toast({
        title: "포인트 조정 완료",
        description: `${amount > 0 ? '+' : ''}${amount}P가 조정되었습니다.`,
      });

      await fetchUsers();

    } catch (error) {
      console.error('포인트 조정 오류:', error);
      toast({
        title: "포인트 조정 실패",
        description: "포인트 조정 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">관리자 패널을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">관리자 패널</h1>
          <p className="text-gray-600">시스템 설정 및 팀 관리</p>
        </div>

        <Tabs defaultValue="system" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="system">시스템 설정</TabsTrigger>
            <TabsTrigger value="teams">팀 관리</TabsTrigger>
            <TabsTrigger value="users">사용자 관리</TabsTrigger>
            <TabsTrigger value="analytics">통계 분석</TabsTrigger>
            <TabsTrigger value="notifications">알림 관리</TabsTrigger>
          </TabsList>

          {/* 시스템 설정 탭 */}
          <TabsContent value="system" className="space-y-6">
            {/* 기능 토글 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>기능 활성화 관리</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Coins className="h-5 w-5 text-yellow-500" />
                      <div>
                        <div className="font-medium">포인트 시스템</div>
                        <div className="text-sm text-gray-600">포인트 지급, 거래, 마켓플레이스 기능</div>
                      </div>
                    </div>
                    <Switch
                      checked={systemSettings?.features_enabled.point_system || false}
                      onCheckedChange={(checked) => 
                        updateSystemSetting('features_enabled', {
                          ...systemSettings?.features_enabled,
                          point_system: checked
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-medium">레포트 마켓플레이스</div>
                        <div className="text-sm text-gray-600">레포트 판매 및 구매 기능</div>
                      </div>
                    </div>
                    <Switch
                      checked={systemSettings?.features_enabled.report_marketplace || false}
                      onCheckedChange={(checked) => 
                        updateSystemSetting('features_enabled', {
                          ...systemSettings?.features_enabled,
                          report_marketplace: checked
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Award className="h-5 w-5 text-purple-500" />
                      <div>
                        <div className="font-medium">배지 시스템</div>
                        <div className="text-sm text-gray-600">업적 및 배지 기능</div>
                      </div>
                    </div>
                    <Switch
                      checked={systemSettings?.features_enabled.badge_system || false}
                      onCheckedChange={(checked) => 
                        updateSystemSetting('features_enabled', {
                          ...systemSettings?.features_enabled,
                          badge_system: checked
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Crown className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="font-medium">보상 시스템</div>
                        <div className="text-sm text-gray-600">특별 보상 및 혜택 기능</div>
                      </div>
                    </div>
                    <Switch
                      checked={systemSettings?.features_enabled.reward_system || false}
                      onCheckedChange={(checked) => 
                        updateSystemSetting('features_enabled', {
                          ...systemSettings?.features_enabled,
                          reward_system: checked
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 평가 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>평가 점수 설정</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>참여 점수</Label>
                    <Input
                      type="number"
                      value={systemSettings?.evaluation_settings.participation_score || 5}
                      onChange={(e) => 
                        updateSystemSetting('evaluation_settings', {
                          ...systemSettings?.evaluation_settings,
                          participation_score: Number(e.target.value)
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>역할 수행 점수</Label>
                    <Input
                      type="number"
                      value={systemSettings?.evaluation_settings.role_score || 10}
                      onChange={(e) => 
                        updateSystemSetting('evaluation_settings', {
                          ...systemSettings?.evaluation_settings,
                          role_score: Number(e.target.value)
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>활동 점수 상한</Label>
                    <Input
                      type="number"
                      value={systemSettings?.evaluation_settings.activity_cap || 30}
                      onChange={(e) => 
                        updateSystemSetting('evaluation_settings', {
                          ...systemSettings?.evaluation_settings,
                          activity_cap: Number(e.target.value)
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label>수익률 점수 최대</Label>
                    <Input
                      type="number"
                      value={systemSettings?.evaluation_settings.return_score_max || 20}
                      onChange={(e) => 
                        updateSystemSetting('evaluation_settings', {
                          ...systemSettings?.evaluation_settings,
                          return_score_max: Number(e.target.value)
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 팀 관리 탭 */}
          <TabsContent value="teams" className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">팀 관리</h3>
              <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    새 팀 생성
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>새 팀 생성</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>팀 이름</Label>
                      <Input
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        placeholder="팀 이름을 입력하세요"
                      />
                    </div>
                    <div>
                      <Label>팀 설명</Label>
                      <Textarea
                        value={newTeamDescription}
                        onChange={(e) => setNewTeamDescription(e.target.value)}
                        placeholder="팀 설명을 입력하세요"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowTeamDialog(false)}>
                        취소
                      </Button>
                      <Button onClick={createNewTeam}>
                        생성
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <Card key={team.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: team.team_color }}
                        />
                        <span>{team.name}</span>
                      </CardTitle>
                      <Badge>{team.member_count}명</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="text-gray-600">팀장: {team.leader_name}</div>
                        <div className="text-gray-600">기록자: {team.fixed_recorder_name}</div>
                      </div>
                      
                      {team.team_slogan && (
                        <div className="text-sm italic text-gray-600">
                          "{team.team_slogan}"
                        </div>
                      )}

                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateTeamImage(team.id, team.name)}
                        >
                          <Image className="h-4 w-4 mr-1" />
                          이미지 생성
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => setSelectedTeam(team)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          설정
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* 팀 설정 다이얼로그 */}
            {selectedTeam && (
              <Dialog open={!!selectedTeam} onOpenChange={() => setSelectedTeam(null)}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>{selectedTeam.name} 팀 설정</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>팀 색상</Label>
                        <Input
                          type="color"
                          value={selectedTeam.team_color}
                          onChange={(e) => setSelectedTeam({...selectedTeam, team_color: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label>멤버 수</Label>
                        <Input value={selectedTeam.member_count} disabled />
                      </div>
                    </div>
                    <div>
                      <Label>팀 슬로건</Label>
                      <Input
                        value={selectedTeam.team_slogan}
                        onChange={(e) => setSelectedTeam({...selectedTeam, team_slogan: e.target.value})}
                        placeholder="팀 슬로건을 입력하세요"
                      />
                    </div>
                    <div>
                      <Label>팀 목표</Label>
                      <Textarea
                        value={selectedTeam.team_goal}
                        onChange={(e) => setSelectedTeam({...selectedTeam, team_goal: e.target.value})}
                        placeholder="팀 목표를 입력하세요"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setSelectedTeam(null)}>
                        취소
                      </Button>
                      <Button onClick={() => {
                        updateTeamSettings(selectedTeam.id, {
                          team_color: selectedTeam.team_color,
                          team_slogan: selectedTeam.team_slogan,
                          team_goal: selectedTeam.team_goal
                        });
                        setSelectedTeam(null);
                      }}>
                        저장
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </TabsContent>

          {/* 사용자 관리 탭 */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>사용자 관리</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">이름</th>
                        <th className="text-left p-2">사용자명</th>
                        <th className="text-left p-2">이메일</th>
                        <th className="text-left p-2">팀</th>
                        <th className="text-left p-2">포인트</th>
                        <th className="text-left p-2">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b">
                          <td className="p-2 font-medium">{user.full_name}</td>
                          <td className="p-2">{user.username}</td>
                          <td className="p-2">{user.email}</td>
                          <td className="p-2">
                            <Badge variant="outline">{user.team_name}</Badge>
                          </td>
                          <td className="p-2">
                            <div className="text-sm">
                              <div>보유: {user.current_points.toLocaleString()}P</div>
                              <div className="text-gray-500">
                                획득: {user.total_earned.toLocaleString()}P / 
                                사용: {user.total_spent.toLocaleString()}P
                              </div>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex space-x-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => {
                                  const amount = prompt('포인트 조정 (음수는 차감)', '0');
                                  const description = prompt('조정 사유', '관리자 조정');
                                  if (amount && description) {
                                    adjustUserPoints(user.id, Number(amount), description);
                                  }
                                }}
                              >
                                <Coins className="h-3 w-3" />
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 통계 분석 탭 */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">총 사용자</p>
                      <p className="text-2xl font-bold">{users.length}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">총 팀 수</p>
                      <p className="text-2xl font-bold">{teams.length}</p>
                    </div>
                    <Shield className="h-8 w-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">총 포인트</p>
                      <p className="text-2xl font-bold">
                        {users.reduce((sum, user) => sum + user.current_points, 0).toLocaleString()}P
                      </p>
                    </div>
                    <Coins className="h-8 w-8 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">평균 팀 크기</p>
                      <p className="text-2xl font-bold">
                        {teams.length > 0 ? (users.length / teams.length).toFixed(1) : 0}명
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 알림 관리 탭 */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>알림 관리</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <Bell className="h-4 w-4" />
                  <AlertDescription>
                    알림 시스템은 추후 구현 예정입니다.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}