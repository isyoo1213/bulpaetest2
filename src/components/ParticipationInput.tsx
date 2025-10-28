import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Save, 
  Clock, 
  Users, 
  MessageCircle, 
  FileText, 
  Share2, 
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface ActivityType {
  id: string;
  name: string;
  description: string;
  max_points: number;
  evaluation_criteria: string;
}

interface MonthlyParticipation {
  id: string;
  user_id: string;
  group_id: string;
  year: number;
  month: number;
  offline_meeting_score: number;
  report_writing_score: number;
  team_mentoring_score: number;
  cross_team_discussion_score: number;
  chat_contribution_score: number;
  resource_sharing_score: number;
  total_score: number;
  status: 'pending' | 'approved' | 'rejected';
}

interface ActivityRecord {
  id: string;
  activity_type: string;
  title: string;
  description: string;
  evidence_url?: string;
  points_earned: number;
  meeting_attendance_status?: string;
  ideas_shared_count?: number;
  reactions_count?: number;
  team_members_helped?: number;
  discussion_participation_level?: string;
}

interface ParticipationInputProps {
  user: User;
}

export default function ParticipationInput({ user }: ParticipationInputProps) {
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [currentParticipation, setCurrentParticipation] = useState<MonthlyParticipation | null>(null);
  const [activityRecords, setActivityRecords] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userGroup, setUserGroup] = useState<any>(null);
  const { toast } = useToast();

  // 새 활동 기록 폼
  const [newActivityForm, setNewActivityForm] = useState({
    activity_type: '',
    title: '',
    description: '',
    evidence_url: '',
    meeting_attendance_status: '',
    ideas_shared_count: 0,
    reactions_count: 0,
    team_members_helped: 0,
    discussion_participation_level: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    if (userProfile && userGroup) {
      fetchParticipationData();
    }
  }, [selectedMonth, selectedYear, userProfile, userGroup]);

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
      }

      // 활동 유형 조회
      const { data: types } = await supabase
        .from('activity_types_2025_09_27_13_00')
        .select('*')
        .order('max_points', { ascending: false });

      setActivityTypes(types || []);

    } catch (error) {
      console.error('초기 데이터 조회 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipationData = async () => {
    if (!userProfile || !userGroup) return;

    try {
      // 월별 참여도 조회
      const { data: participation } = await supabase
        .from('monthly_participation_2025_09_27_13_00')
        .select('*')
        .eq('user_id', userProfile.id)
        .eq('group_id', userGroup.id)
        .eq('year', selectedYear)
        .eq('month', selectedMonth)
        .single();

      setCurrentParticipation(participation);

      // 활동 기록 조회
      if (participation) {
        const { data: records } = await supabase
          .from('activity_records_2025_09_27_13_00')
          .select('*')
          .eq('monthly_participation_id', participation.id)
          .order('created_at', { ascending: false });

        setActivityRecords(records || []);
      } else {
        setActivityRecords([]);
      }

    } catch (error) {
      console.error('참여도 데이터 조회 오류:', error);
      setCurrentParticipation(null);
      setActivityRecords([]);
    }
  };

  const createMonthlyParticipation = async () => {
    if (!userProfile || !userGroup) return null;

    try {
      const { data, error } = await supabase
        .from('monthly_participation_2025_09_27_13_00')
        .insert({
          user_id: userProfile.id,
          group_id: userGroup.id,
          year: selectedYear,
          month: selectedMonth,
          total_score: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('월별 참여도 생성 오류:', error);
      return null;
    }
  };

  const calculatePoints = (activityType: string, formData: any) => {
    switch (activityType) {
      case 'offline_meeting':
        if (formData.meeting_attendance_status === 'on_time' && formData.ideas_shared_count > 0) {
          return 10;
        } else if (formData.meeting_attendance_status === 'on_time') {
          return 8;
        } else if (formData.meeting_attendance_status === 'late') {
          return 5;
        }
        return 0;

      case 'report_writing':
        // 팀 레포트는 별도 로직으로 처리
        return 0;

      case 'team_mentoring':
        if (formData.team_members_helped > 0) {
          return 20;
        }
        return 0;

      case 'cross_team_discussion':
        if (formData.discussion_participation_level === 'presenter') {
          return 20;
        } else if (formData.discussion_participation_level === 'active') {
          return 15;
        } else if (formData.discussion_participation_level === 'passive') {
          return 10;
        }
        return 0;

      case 'chat_contribution':
        if (formData.reactions_count >= 5) {
          return 20;
        } else if (formData.reactions_count >= 3) {
          return 15;
        }
        return 0;

      case 'resource_sharing':
        if (formData.reactions_count >= 5) {
          return 5;
        } else if (formData.reactions_count >= 3) {
          return 3;
        }
        return 0;

      default:
        return 0;
    }
  };

  const handleAddActivity = async () => {
    if (!newActivityForm.activity_type || !newActivityForm.title) {
      toast({
        title: "입력 오류",
        description: "활동 유형과 제목을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // 월별 참여도가 없으면 생성
      let participation = currentParticipation;
      if (!participation) {
        participation = await createMonthlyParticipation();
        if (!participation) {
          throw new Error('월별 참여도 생성에 실패했습니다.');
        }
        setCurrentParticipation(participation);
      }

      // 점수 계산
      const pointsEarned = calculatePoints(newActivityForm.activity_type, newActivityForm);

      // 활동 기록 추가
      const { data: newRecord, error: recordError } = await supabase
        .from('activity_records_2025_09_27_13_00')
        .insert({
          monthly_participation_id: participation.id,
          activity_type: newActivityForm.activity_type,
          title: newActivityForm.title,
          description: newActivityForm.description,
          evidence_url: newActivityForm.evidence_url || null,
          points_earned: pointsEarned,
          meeting_attendance_status: newActivityForm.meeting_attendance_status || null,
          ideas_shared_count: newActivityForm.ideas_shared_count || 0,
          reactions_count: newActivityForm.reactions_count || 0,
          team_members_helped: newActivityForm.team_members_helped || 0,
          discussion_participation_level: newActivityForm.discussion_participation_level || null
        })
        .select()
        .single();

      if (recordError) throw recordError;

      // 월별 참여도 점수 업데이트
      const updatedScores = { ...participation };
      const scoreField = `${newActivityForm.activity_type}_score`;
      updatedScores[scoreField] = (updatedScores[scoreField] || 0) + pointsEarned;
      updatedScores.total_score = Object.keys(updatedScores)
        .filter(key => key.endsWith('_score') && key !== 'total_score')
        .reduce((sum, key) => sum + (updatedScores[key] || 0), 0);

      const { error: updateError } = await supabase
        .from('monthly_participation_2025_09_27_13_00')
        .update(updatedScores)
        .eq('id', participation.id);

      if (updateError) throw updateError;

      toast({
        title: "활동 기록 추가 완료",
        description: `${pointsEarned}점이 추가되었습니다.`,
      });

      // 폼 초기화 및 데이터 새로고침
      setNewActivityForm({
        activity_type: '',
        title: '',
        description: '',
        evidence_url: '',
        meeting_attendance_status: '',
        ideas_shared_count: 0,
        reactions_count: 0,
        team_members_helped: 0,
        discussion_participation_level: ''
      });

      fetchParticipationData();

    } catch (error: any) {
      toast({
        title: "활동 기록 추가 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
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

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'offline_meeting':
        return <Users className="h-4 w-4" />;
      case 'report_writing':
        return <FileText className="h-4 w-4" />;
      case 'team_mentoring':
        return <Award className="h-4 w-4" />;
      case 'cross_team_discussion':
        return <MessageCircle className="h-4 w-4" />;
      case 'chat_contribution':
        return <MessageCircle className="h-4 w-4" />;
      case 'resource_sharing':
        return <Share2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getActivityTypeKorean = (activityType: string) => {
    const typeMap = {
      'offline_meeting': '오프라인 모임 참석',
      'report_writing': '레포트 작성',
      'team_mentoring': '팀 지원/멘토링',
      'cross_team_discussion': '타팀 토론 참여',
      'chat_contribution': '톡방 기여',
      'resource_sharing': '의미있는 자료 공유'
    };
    return typeMap[activityType] || activityType;
  };

  if (loading && !activityTypes.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">참여도 시스템을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">참여도 입력</h1>
          <p className="text-gray-600">월별 활동을 기록하고 참여도를 관리하세요</p>
        </div>

        {/* 월/년 선택 */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <Label>기간 선택:</Label>
              </div>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}년</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                    <SelectItem key={month} value={month.toString()}>{month}월</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="input" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="input">활동 입력</TabsTrigger>
            <TabsTrigger value="records">활동 기록</TabsTrigger>
            <TabsTrigger value="summary">월별 요약</TabsTrigger>
          </TabsList>

          {/* 활동 입력 */}
          <TabsContent value="input" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  <span>새 활동 기록 추가</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="activity_type">활동 유형</Label>
                    <Select 
                      value={newActivityForm.activity_type} 
                      onValueChange={(value) => setNewActivityForm({...newActivityForm, activity_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="활동 유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="offline_meeting">오프라인 모임 참석 (10점)</SelectItem>
                        <SelectItem value="team_mentoring">팀 지원/멘토링 (20점)</SelectItem>
                        <SelectItem value="cross_team_discussion">타팀 토론 참여 (20점)</SelectItem>
                        <SelectItem value="chat_contribution">톡방 기여 (20점)</SelectItem>
                        <SelectItem value="resource_sharing">의미있는 자료 공유 (5점)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">활동 제목</Label>
                    <Input
                      id="title"
                      placeholder="예: 8월 정기 모임 참석"
                      value={newActivityForm.title}
                      onChange={(e) => setNewActivityForm({...newActivityForm, title: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">활동 설명</Label>
                  <Textarea
                    id="description"
                    placeholder="활동에 대한 상세한 설명을 입력하세요"
                    value={newActivityForm.description}
                    onChange={(e) => setNewActivityForm({...newActivityForm, description: e.target.value})}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evidence_url">증빙 자료 URL (선택)</Label>
                  <Input
                    id="evidence_url"
                    placeholder="관련 자료나 증빙 링크"
                    value={newActivityForm.evidence_url}
                    onChange={(e) => setNewActivityForm({...newActivityForm, evidence_url: e.target.value})}
                  />
                </div>

                {/* 활동 유형별 추가 필드 */}
                {newActivityForm.activity_type === 'offline_meeting' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>참석 상태</Label>
                      <Select 
                        value={newActivityForm.meeting_attendance_status} 
                        onValueChange={(value) => setNewActivityForm({...newActivityForm, meeting_attendance_status: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="참석 상태 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="on_time">정시 참석</SelectItem>
                          <SelectItem value="late">지각</SelectItem>
                          <SelectItem value="absent">불참</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>공유한 아이디어 수</Label>
                      <Input
                        type="number"
                        min="0"
                        value={newActivityForm.ideas_shared_count}
                        onChange={(e) => setNewActivityForm({...newActivityForm, ideas_shared_count: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                )}

                {newActivityForm.activity_type === 'team_mentoring' && (
                  <div className="space-y-2">
                    <Label>도움을 준 팀원 수</Label>
                    <Input
                      type="number"
                      min="0"
                      value={newActivityForm.team_members_helped}
                      onChange={(e) => setNewActivityForm({...newActivityForm, team_members_helped: parseInt(e.target.value) || 0})}
                    />
                  </div>
                )}

                {newActivityForm.activity_type === 'cross_team_discussion' && (
                  <div className="space-y-2">
                    <Label>참여 수준</Label>
                    <Select 
                      value={newActivityForm.discussion_participation_level} 
                      onValueChange={(value) => setNewActivityForm({...newActivityForm, discussion_participation_level: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="참여 수준 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="presenter">발표자 (20점)</SelectItem>
                        <SelectItem value="active">적극적 참여 (15점)</SelectItem>
                        <SelectItem value="passive">소극적 참여 (10점)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {(newActivityForm.activity_type === 'chat_contribution' || newActivityForm.activity_type === 'resource_sharing') && (
                  <div className="space-y-2">
                    <Label>받은 반응 수 (좋아요 + 댓글)</Label>
                    <Input
                      type="number"
                      min="0"
                      placeholder="좋아요와 댓글 수의 합계"
                      value={newActivityForm.reactions_count}
                      onChange={(e) => setNewActivityForm({...newActivityForm, reactions_count: parseInt(e.target.value) || 0})}
                    />
                  </div>
                )}

                <Button 
                  onClick={handleAddActivity} 
                  disabled={loading || !newActivityForm.activity_type || !newActivityForm.title}
                  className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  활동 기록 추가
                </Button>
              </CardContent>
            </Card>

            {/* 활동 유형 가이드 */}
            <Card>
              <CardHeader>
                <CardTitle>활동 유형별 평가 기준</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activityTypes.map((type) => (
                    <div key={type.id} className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        {getActivityIcon(type.name)}
                        <h4 className="font-semibold">{type.name}</h4>
                        <Badge variant="outline">{type.max_points}점</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{type.description}</p>
                      <p className="text-xs text-gray-500">{type.evaluation_criteria}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 활동 기록 */}
          <TabsContent value="records" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-green-600" />
                  <span>{selectedYear}년 {selectedMonth}월 활동 기록</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {activityRecords.length > 0 ? (
                  <div className="space-y-4">
                    {activityRecords.map((record) => (
                      <div key={record.id} className="p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getActivityIcon(record.activity_type)}
                            <h4 className="font-semibold">{record.title}</h4>
                            <Badge variant="outline">
                              {getActivityTypeKorean(record.activity_type)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className="bg-blue-100 text-blue-800">
                              +{record.points_earned}점
                            </Badge>
                          </div>
                        </div>
                        {record.description && (
                          <p className="text-sm text-gray-600 mb-2">{record.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {record.meeting_attendance_status && (
                            <span>참석: {record.meeting_attendance_status === 'on_time' ? '정시' : record.meeting_attendance_status === 'late' ? '지각' : '불참'}</span>
                          )}
                          {record.ideas_shared_count > 0 && (
                            <span>아이디어: {record.ideas_shared_count}개</span>
                          )}
                          {record.reactions_count > 0 && (
                            <span>반응: {record.reactions_count}개</span>
                          )}
                          {record.team_members_helped > 0 && (
                            <span>도움: {record.team_members_helped}명</span>
                          )}
                          {record.discussion_participation_level && (
                            <span>참여: {record.discussion_participation_level}</span>
                          )}
                          {record.evidence_url && (
                            <a href={record.evidence_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                              증빙자료
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600">이번 달 활동 기록이 없습니다.</p>
                    <p className="text-sm text-gray-500">활동 입력 탭에서 기록을 추가해보세요.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 월별 요약 */}
          <TabsContent value="summary" className="space-y-6">
            {currentParticipation ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-purple-600" />
                      <span>{selectedYear}년 {selectedMonth}월 참여도 요약</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(currentParticipation.status)}
                      <Badge className={getStatusColor(currentParticipation.status)}>
                        {currentParticipation.status === 'approved' ? '승인됨' : 
                         currentParticipation.status === 'rejected' ? '반려됨' : '승인 대기'}
                      </Badge>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {currentParticipation.total_score}점
                      </div>
                      <p className="text-sm text-gray-600">총 참여도 점수</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {activityRecords.length}개
                      </div>
                      <p className="text-sm text-gray-600">총 활동 수</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {Math.round((currentParticipation.total_score / 85) * 100)}%
                      </div>
                      <p className="text-sm text-gray-600">달성률 (85점 만점)</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">활동별 점수 현황</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'offline_meeting_score', name: '오프라인 모임 참석', max: 10 },
                        { key: 'report_writing_score', name: '레포트 작성', max: 10 },
                        { key: 'team_mentoring_score', name: '팀 지원/멘토링', max: 20 },
                        { key: 'cross_team_discussion_score', name: '타팀 토론 참여', max: 20 },
                        { key: 'chat_contribution_score', name: '톡방 기여', max: 20 },
                        { key: 'resource_sharing_score', name: '의미있는 자료 공유', max: 5 }
                      ].map((activity) => {
                        const score = currentParticipation[activity.key] || 0;
                        const percentage = (score / activity.max) * 100;
                        
                        return (
                          <div key={activity.key}>
                            <div className="flex justify-between text-sm mb-1">
                              <span>{activity.name}</span>
                              <span>{score}/{activity.max}점</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {selectedYear}년 {selectedMonth}월 참여도 기록이 없습니다
                  </h3>
                  <p className="text-gray-600 mb-4">활동을 기록하면 월별 요약을 확인할 수 있습니다.</p>
                  <Button 
                    onClick={() => document.querySelector('[value="input"]')?.click()}
                    className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                  >
                    활동 기록하기
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}