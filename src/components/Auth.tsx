import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

interface AuthProps {
  onAuthChange: (user: User | null) => void;
}

export default function Auth({ onAuthChange }: AuthProps) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  // 테스트 연결 함수
  const testConnection = async () => {
    setTesting(true);
    try {
      console.log('=== Supabase 연결 테스트 ===');
      
      // 1. 기본 연결 테스트
      const { data, error } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('count')
        .limit(1);
      
      if (error) {
        console.error('연결 테스트 실패:', error);
        toast({
          title: "❌ 연결 실패",
          description: `데이터베이스 연결 실패: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      console.log('연결 테스트 성공:', data);
      
      // 2. Auth 서비스 테스트
      const { data: authData, error: authError } = await supabase.auth.getSession();
      console.log('Auth 서비스 상태:', { authData, authError });
      
      toast({
        title: "✅ 연결 성공!",
        description: "Supabase 데이터베이스와 Auth 서비스가 정상 작동합니다.",
      });
      
    } catch (error: any) {
      console.error('연결 테스트 예외:', error);
      toast({
        title: "❌ 연결 오류",
        description: `네트워크 오류: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  // 추천 계정 자동 입력 함수
  const fillAdminAccount = () => {
    setEmail('admin@test.com');
    setPassword('admin123!');
    setUsername('admin');
    setFullName('시스템 관리자');
    toast({
      title: "📝 자동 입력 완료",
      description: "관리자 계정 정보가 입력되었습니다.",
    });
  };

  const fillUserAccount = () => {
    setEmail('user@test.com');
    setPassword('user123!');
    setUsername('testuser');
    setFullName('테스트 사용자');
    toast({
      title: "📝 자동 입력 완료",
      description: "일반 사용자 계정 정보가 입력되었습니다.",
    });
  };

  useEffect(() => {
    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session: Session | null) => {
        if (session?.user) {
          onAuthChange(session.user);
          
          // 새 사용자인 경우 프로필 생성
          if (event === 'SIGNED_UP') {
            await createUserProfile(session.user, username, fullName);
          }
        } else {
          onAuthChange(null);
        }
        setLoading(false);
      }
    );

    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      onAuthChange(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [onAuthChange, username, fullName]);

  const createUserProfile = async (user: User, username: string, fullName: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .insert({
          user_id: user.id,
          username: username || user.email?.split('@')[0] || 'user',
          full_name: fullName || user.email?.split('@')[0] || 'User',
          initial_capital: 10000000, // 기본 1천만원
          current_capital: 10000000
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('프로필 생성 오류:', error.message);
    }
  };

  const signUp = async () => {
    // 입력 검증
    if (!email?.trim() || !password?.trim()) {
      toast({
        title: "❌ 입력 오류",
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (!username?.trim() || !fullName?.trim()) {
      toast({
        title: "❌ 입력 오류", 
        description: "사용자명과 이름을 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "❌ 비밀번호 오류",
        description: "비밀번호는 최소 6자 이상이어야 합니다.",
        variant: "destructive",
      });
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "❌ 이메일 형식 오류",
        description: "올바른 이메일 형식을 입력해주세요. (예: user@example.com)",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('=== 회원가입 시도 ===');
      console.log('이메일:', email);
      console.log('사용자명:', username);
      console.log('이름:', fullName);
      
      // Supabase 연결 테스트
      const { data: testData, error: testError } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('Supabase 연결 테스트 실패:', testError);
        toast({
          title: "❌ 데이터베이스 연결 오류",
          description: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Supabase 연결 테스트 성공');

      // 회원가입 시도
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: username.trim(),
            full_name: fullName.trim()
          }
        }
      });

      console.log('회원가입 응답:', { 
        user: data?.user ? '사용자 생성됨' : '사용자 없음',
        session: data?.session ? '세션 생성됨' : '세션 없음',
        error: error?.message || '오류 없음'
      });

      if (error) {
        console.error('회원가입 오류:', error);
        
        let errorMessage = "회원가입에 실패했습니다.";
        let title = "❌ 회원가입 실패";
        
        if (error.message.includes("already registered") || error.message.includes("User already registered")) {
          title = "⚠️ 이미 등록된 계정";
          errorMessage = "이미 등록된 이메일입니다. 로그인 탭에서 로그인을 시도해보세요.";
        } else if (error.message.includes("Invalid email")) {
          title = "❌ 이메일 형식 오류";
          errorMessage = "올바른 이메일 형식을 입력해주세요. (예: user@example.com)";
        } else if (error.message.includes("Password") || error.message.includes("password")) {
          title = "❌ 비밀번호 오류";
          errorMessage = "비밀번호는 최소 6자 이상이어야 합니다.";
        } else if (error.message.includes("Email rate limit") || error.message.includes("rate limit")) {
          title = "⏰ 시도 횟수 초과";
          errorMessage = "너무 많은 가입 시도가 있었습니다. 5분 후 다시 시도해주세요.";
        } else if (error.message.includes("Signup is disabled")) {
          title = "🚫 가입 비활성화";
          errorMessage = "현재 새로운 가입이 비활성화되어 있습니다. 관리자에게 문의해주세요.";
        } else {
          errorMessage = `회원가입 오류: ${error.message}`;
        }
        
        toast({
          title,
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // 회원가입 성공 처리
      if (data?.user) {
        console.log('회원가입 성공! 사용자 ID:', data.user.id);
        
        toast({
          title: "✅ 회원가입 성공!",
          description: `${fullName}님, 계정이 성공적으로 생성되었습니다!`,
        });

        // 세션이 있으면 바로 로그인 완료
        if (data.session) {
          console.log('세션 자동 생성됨 - 로그인 완료');
          toast({
            title: "🎉 자동 로그인 성공!",
            description: `${fullName}님, 불패스터디에 오신 것을 환영합니다!`,
          });
        } else {
          // 세션이 없으면 수동 로그인 시도
          console.log('세션 없음 - 수동 로그인 시도');
          setTimeout(async () => {
            try {
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password.trim(),
              });

              if (signInError) {
                console.error('자동 로그인 오류:', signInError);
                toast({
                  title: "⚠️ 자동 로그인 실패",
                  description: "회원가입은 완료되었습니다. 로그인 탭에서 수동으로 로그인해주세요.",
                  variant: "destructive",
                });
              } else {
                console.log('수동 로그인 성공');
                toast({
                  title: "🎉 로그인 성공!",
                  description: `${fullName}님, 불패스터디에 오신 것을 환영합니다!`,
                });
              }
            } catch (autoLoginError) {
              console.error('자동 로그인 예외:', autoLoginError);
              toast({
                title: "⚠️ 자동 로그인 오류",
                description: "회원가입은 완료되었습니다. 로그인 탭에서 수동으로 로그인해주세요.",
                variant: "destructive",
              });
            }
          }, 1500);
        }
      } else {
        console.log('회원가입 응답에 사용자 정보 없음');
        toast({
          title: "⚠️ 회원가입 상태 불명",
          description: "회원가입 처리 중입니다. 잠시 후 로그인을 시도해보세요.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('회원가입 예외:', error);
      toast({
        title: "❌ 네트워크 오류",
        description: `연결 오류: ${error.message}. 인터넷 연결을 확인하고 다시 시도해주세요.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const signIn = async () => {
    // 입력 검증
    if (!email?.trim() || !password?.trim()) {
      toast({
        title: "❌ 입력 오류",
        description: "이메일과 비밀번호를 모두 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "❌ 이메일 형식 오류",
        description: "올바른 이메일 형식을 입력해주세요. (예: user@example.com)",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('=== 로그인 시도 ===');
      console.log('이메일:', email);
      
      // Supabase 연결 테스트
      const { data: testData, error: testError } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('count')
        .limit(1);
      
      if (testError) {
        console.error('Supabase 연결 테스트 실패:', testError);
        toast({
          title: "❌ 데이터베이스 연결 오류",
          description: "서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
        return;
      }
      
      console.log('Supabase 연결 테스트 성공');
      
      // 로그인 시도
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      console.log('로그인 응답:', { 
        user: data?.user ? '사용자 인증됨' : '사용자 없음',
        session: data?.session ? '세션 생성됨' : '세션 없음',
        error: error?.message || '오류 없음'
      });

      if (error) {
        console.error('로그인 오류:', error);
        
        let errorMessage = "로그인에 실패했습니다.";
        let title = "❌ 로그인 실패";
        
        if (error.message.includes("Invalid login credentials") || error.message.includes("invalid_credentials")) {
          title = "🔐 인증 실패";
          errorMessage = "이메일 또는 비밀번호가 올바르지 않습니다.\n\n• 이메일 주소를 정확히 입력했는지 확인해주세요\n• 비밀번호를 다시 확인해주세요\n• 아직 회원가입을 하지 않았다면 회원가입 탭을 이용해주세요";
        } else if (error.message.includes("Email not confirmed")) {
          title = "📧 이메일 인증 필요";
          errorMessage = "이메일 인증이 완료되지 않았습니다. 이메일을 확인하고 인증 링크를 클릭해주세요.";
        } else if (error.message.includes("Too many requests") || error.message.includes("rate limit")) {
          title = "⏰ 시도 횟수 초과";
          errorMessage = "너무 많은 로그인 시도가 있었습니다. 5분 후 다시 시도해주세요.";
        } else if (error.message.includes("User not found")) {
          title = "👤 사용자 없음";
          errorMessage = "등록되지 않은 이메일입니다. 회원가입 탭에서 먼저 계정을 생성해주세요.";
        } else if (error.message.includes("Invalid email")) {
          title = "📧 이메일 형식 오류";
          errorMessage = "올바른 이메일 형식을 입력해주세요. (예: user@example.com)";
        } else if (error.message.includes("Signup is disabled")) {
          title = "🚫 로그인 비활성화";
          errorMessage = "현재 로그인이 비활성화되어 있습니다. 관리자에게 문의해주세요.";
        } else {
          errorMessage = `로그인 오류: ${error.message}`;
        }
        
        toast({
          title,
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      // 로그인 성공
      if (data?.user && data?.session) {
        console.log('로그인 성공! 사용자 ID:', data.user.id);
        toast({
          title: "🎉 로그인 성공!",
          description: "불패스터디에 오신 것을 환영합니다!",
        });
      } else {
        console.log('로그인 응답에 사용자 또는 세션 정보 없음');
        toast({
          title: "⚠️ 로그인 상태 불명",
          description: "로그인 처리 중입니다. 잠시 후 다시 시도해주세요.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('로그인 예외:', error);
      toast({
        title: "❌ 네트워크 오류",
        description: `연결 오류: ${error.message}. 인터넷 연결을 확인하고 다시 시도해주세요.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            불패스터디
          </CardTitle>
          <CardDescription>
            투자 스터디 그룹 대시보드
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* 연결 테스트 버튼 */}
          <div className="mb-4 text-center">
            <Button
              onClick={testConnection}
              disabled={testing}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              {testing ? '테스트 중...' : '🔗 연결 테스트'}
            </Button>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="이메일 (예: user@example.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && signIn()}
                />
                <Input
                  type="password"
                  placeholder="비밀번호"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && signIn()}
                />
              </div>
              <Button 
                onClick={signIn} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              >
                {loading ? '로그인 중...' : '로그인'}
              </Button>
              
              <div className="text-center space-y-2">
                <div className="text-sm font-medium text-orange-600">
                  🔐 로그인에 문제가 있으신가요?
                </div>
                <div className="text-xs text-gray-600 space-y-1 bg-orange-50 p-3 rounded-lg">
                  <div>• 이메일과 비밀번호를 정확히 입력했는지 확인해주세요</div>
                  <div>• 아직 계정이 없다면 <strong>회원가입 탭</strong>을 이용해주세요</div>
                  <div>• 추천 테스트 계정: admin@test.com / admin123!</div>
                  <div>• 문제가 지속되면 새로고침 후 다시 시도해주세요</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              {/* 자동 입력 버튼들 */}
              <div className="flex space-x-2 mb-4">
                <Button
                  onClick={fillAdminAccount}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  type="button"
                >
                  👑 관리자 정보 입력
                </Button>
                <Button
                  onClick={fillUserAccount}
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  type="button"
                >
                  👤 사용자 정보 입력
                </Button>
              </div>

              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="사용자명 (예: admin, testuser)"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                <Input
                  type="text"
                  placeholder="이름 (예: 홍길동)"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="이메일 (예: admin@test.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="비밀번호 (최소 6자)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                onClick={signUp} 
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
              >
                {loading ? '가입 중...' : '회원가입'}
              </Button>
              
              <div className="text-center space-y-2">
                <div className="text-sm font-medium text-blue-600">
                  💡 테스트 계정 추천
                </div>
                <div className="text-xs text-gray-600 space-y-1 bg-blue-50 p-3 rounded-lg">
                  <div className="font-medium text-blue-700">🔥 추천 관리자 계정:</div>
                  <div className="bg-white p-2 rounded border">
                    <div>📧 이메일: <span className="font-mono">admin@test.com</span></div>
                    <div>🔑 비밀번호: <span className="font-mono">admin123!</span></div>
                    <div>👤 사용자명: <span className="font-mono">admin</span></div>
                    <div>🏷️ 이름: <span className="font-mono">시스템 관리자</span></div>
                  </div>
                  <hr className="my-2" />
                  <div className="font-medium text-green-700">👤 추천 일반 사용자:</div>
                  <div className="bg-white p-2 rounded border">
                    <div>📧 이메일: <span className="font-mono">user@test.com</span></div>
                    <div>🔑 비밀번호: <span className="font-mono">user123!</span></div>
                    <div>👤 사용자명: <span className="font-mono">testuser</span></div>
                    <div>🏷️ 이름: <span className="font-mono">테스트 사용자</span></div>
                  </div>
                  <hr className="my-2" />
                  <div className="text-center space-y-1">
                    <div className="text-green-600 font-medium">✅ 위 정보를 정확히 입력하세요</div>
                    <div className="text-orange-600 font-medium">⚠️ 모든 필드를 빠짐없이 입력해야 합니다</div>
                    <div className="text-blue-600 font-medium">🎯 회원가입 후 자동 로그인됩니다</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}