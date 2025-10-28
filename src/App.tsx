import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Auth from '@/components/Auth';
import SimpleAuth from '@/components/SimpleAuth';
import DirectAuth from '@/components/DirectAuth';
import Dashboard from '@/components/Dashboard';
import NewInvestment from '@/components/NewInvestment';
import Community from '@/components/Community';
import Ranking from '@/components/Ranking';
import GroupRanking from '@/components/GroupRanking';
import Participation from '@/components/Participation';
import ParticipationInput from '@/components/ParticipationInput';
import TeamDashboard from '@/components/TeamDashboard';
import ReportMarketplace from '@/components/ReportMarketplace';
import NewEvaluationSystem from '@/components/NewEvaluationSystem';
import AdminPanel from '@/components/AdminPanel';
import UserGuide from '@/components/UserGuide';
import { 
  Home, 
  TrendingUp, 
  MessageCircle, 
  Trophy, 
  Users,
  Activity,
  Edit,
  BarChart3,
  FileText,
  LogOut,
  Menu,
  X,
  ClipboardCheck,
  Settings,
  BookOpen
} from 'lucide-react';

type TabType = 'dashboard' | 'investment' | 'group-ranking' | 'team-dashboard' | 'new-evaluation' | 'admin' | 'guide';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [testMode, setTestMode] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // 직접 로그인 시스템 사용 시 localStorage에서 사용자 정보 복원
    const savedUser = localStorage.getItem('directAuth_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUser(user);
        setLoading(false);
        return;
      } catch (error) {
        localStorage.removeItem('directAuth_user');
      }
    }

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      // 직접 로그인 시스템 로그아웃
      localStorage.removeItem('directAuth_user');
      
      // Supabase Auth 로그아웃
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      
      toast({
        title: "로그아웃 완료",
        description: "성공적으로 로그아웃되었습니다.",
      });
    } catch (error: any) {
      toast({
        title: "로그아웃 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // 사용자 권한 확인
  const isAdmin = user?.user_metadata?.username === 'admin' || user?.email === 'admin@bulpae.com';

  const tabs = [
    { id: 'dashboard' as TabType, label: '대시보드', icon: Home },
    { id: 'new-evaluation' as TabType, label: '평가시스템', icon: ClipboardCheck },
    { id: 'team-dashboard' as TabType, label: '팀 현황', icon: BarChart3 },
    { id: 'group-ranking' as TabType, label: '그룹 순위', icon: Users },
    { id: 'investment' as TabType, label: '투자 기록', icon: TrendingUp },
    { id: 'guide' as TabType, label: '사용자 가이드', icon: BookOpen },
    ...(isAdmin ? [{ id: 'admin' as TabType, label: '관리자', icon: Settings }] : []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">불패스터디를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // URL 파라미터 확인
    const urlParams = new URLSearchParams(window.location.search);
    const useTestMode = urlParams.get('test') === 'true';
    const useDirectMode = urlParams.get('direct') === 'true' || testMode;
    
    if (useDirectMode) {
      return <DirectAuth onAuthChange={setUser} />;
    } else if (useTestMode) {
      return <SimpleAuth onAuthChange={setUser} />;
    } else {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <Auth onAuthChange={setUser} />
            <div className="mt-4 space-y-2">
              <div>
                <button
                  onClick={() => setTestMode(true)}
                  className="text-sm text-blue-600 hover:text-blue-800 underline block mx-auto"
                >
                  🔧 문제가 계속되면 여기를 클릭하세요 (직접 로그인)
                </button>
              </div>
              <div className="text-xs text-gray-500">
                또는 URL에 ?direct=true 추가
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'new-evaluation':
        return <NewEvaluationSystem user={user} />;
      case 'team-dashboard':
        return <TeamDashboard user={user} />;
      case 'investment':
        return <NewInvestment user={user} />;
      case 'group-ranking':
        return <GroupRanking user={user} />;
      case 'guide':
        return <UserGuide />;
      case 'admin':
        return isAdmin ? <AdminPanel user={user} /> : <Dashboard user={user} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 바 */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                불패스터디
              </h1>
            </div>

            {/* 데스크톱 네비게이션 */}
            <div className="hidden md:flex items-center space-x-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 로그아웃 버튼 */}
            <div className="hidden md:flex items-center">
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="text-gray-600 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </div>

            {/* 모바일 메뉴 버튼 */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900 p-2"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* 모바일 메뉴 */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t bg-white">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center space-x-2 w-full px-3 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        {renderContent()}
      </main>
    </div>
  );
}