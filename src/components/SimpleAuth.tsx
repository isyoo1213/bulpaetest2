import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface SimpleAuthProps {
  onAuthChange: (user: User | null) => void;
}

export default function SimpleAuth({ onAuthChange }: SimpleAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const { toast } = useToast();

  const addDebugInfo = (info: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => `${prev}\n[${timestamp}] ${info}`);
    console.log(`[${timestamp}] ${info}`);
  };

  const testConnection = async () => {
    addDebugInfo('=== 연결 테스트 시작 ===');
    
    try {
      // 1. 기본 쿼리 테스트
      const { data, error } = await supabase
        .from('user_profiles_2025_09_27_12_14')
        .select('count')
        .limit(1);
      
      if (error) {
        addDebugInfo(`❌ 데이터베이스 연결 실패: ${error.message}`);
        return false;
      }
      
      addDebugInfo('✅ 데이터베이스 연결 성공');
      
      // 2. Auth 서비스 테스트
      const { data: session } = await supabase.auth.getSession();
      addDebugInfo(`✅ Auth 서비스 연결 성공 (현재 세션: ${session.session ? '있음' : '없음'})`);
      
      return true;
    } catch (error: any) {
      addDebugInfo(`❌ 연결 테스트 실패: ${error.message}`);
      return false;
    }
  };

  const createTestAccount = async (accountType: 'admin' | 'user') => {
    addDebugInfo(`=== ${accountType === 'admin' ? '관리자' : '일반 사용자'} 계정 생성 시작 (관리자 권한) ===`);
    setLoading(true);
    
    try {
      addDebugInfo(`Edge Function을 통한 계정 생성 시도...`);
      
      // Edge Function 호출
      const { data, error } = await supabase.functions.invoke('create_test_accounts_admin_2025_10_20_09_45', {
        body: { accountType }
      });
      
      if (error) {
        addDebugInfo(`❌ Edge Function 호출 실패: ${error.message}`);
        toast({
          title: "계정 생성 실패",
          description: `서버 오류: ${error.message}`,
          variant: "destructive",
        });
        return;
      }
      
      if (data.success) {
        const account = data.account;
        addDebugInfo(`✅ 계정 생성 성공: ${account.email}`);
        addDebugInfo(`사용자 ID: ${account.user_id}`);
        addDebugInfo(`프로필 ID: ${account.profile_id || '없음'}`);
        
        // 자동 입력
        setEmail(account.email);
        setPassword(account.password);
        
        toast({
          title: "✅ 테스트 계정 생성 완료!",
          description: `${accountType === 'admin' ? '관리자' : '사용자'} 계정: ${account.email}`,
        });
        
        // 자동 로그인 시도
        addDebugInfo(`자동 로그인 시도 중...`);
        setTimeout(async () => {
          try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: account.email,
              password: account.password,
            });
            
            if (signInError) {
              addDebugInfo(`❌ 자동 로그인 실패: ${signInError.message}`);
              toast({
                title: "⚠️ 자동 로그인 실패",
                description: "계정은 생성되었습니다. 수동으로 로그인해주세요.",
                variant: "destructive",
              });
            } else if (signInData.user && signInData.session) {
              addDebugInfo(`✅ 자동 로그인 성공!`);
              toast({
                title: "🎉 로그인 성공!",
                description: `${account.full_name}님, 환영합니다!`,
              });
              onAuthChange(signInData.user);
            }
          } catch (autoLoginError: any) {
            addDebugInfo(`❌ 자동 로그인 예외: ${autoLoginError.message}`);
          }
        }, 1000);
        
      } else {
        addDebugInfo(`❌ 계정 생성 실패: ${data.error || '알 수 없는 오류'}`);
        toast({
          title: "계정 생성 실패",
          description: data.error || '알 수 없는 오류가 발생했습니다.',
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      addDebugInfo(`❌ 계정 생성 예외: ${error.message}`);
      toast({
        title: "계정 생성 오류",
        description: `네트워크 오류: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const simpleLogin = async () => {
    if (!email || !password) {
      toast({
        title: "입력 오류",
        description: "이메일과 비밀번호를 입력하세요.",
        variant: "destructive",
      });
      return;
    }
    
    addDebugInfo('=== 로그인 시도 ===');
    addDebugInfo(`이메일: ${email}`);
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        addDebugInfo(`❌ 로그인 실패: ${error.message}`);
        toast({
          title: "로그인 실패",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      if (data.user && data.session) {
        addDebugInfo(`✅ 로그인 성공: ${data.user.id}`);
        addDebugInfo(`세션 토큰: ${data.session.access_token.substring(0, 20)}...`);
        
        toast({
          title: "🎉 로그인 성공!",
          description: "테스트 계정으로 로그인되었습니다.",
        });
        
        onAuthChange(data.user);
      }
      
    } catch (error: any) {
      addDebugInfo(`❌ 로그인 예외: ${error.message}`);
      toast({
        title: "로그인 오류",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const quickFillAdmin = () => {
    setEmail('admin@bulpae.com');
    setPassword('admin123!');
    addDebugInfo('관리자 계정 정보 자동 입력 완료');
  };

  const quickFillUser = () => {
    setEmail('user@bulpae.com');
    setPassword('user123!');
    addDebugInfo('일반 사용자 계정 정보 자동 입력 완료');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 로그인 폼 */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              🔧 간단 테스트 로그인
            </CardTitle>
            <CardDescription>
              문제 해결을 위한 테스트 버전
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 연결 테스트 */}
            <Button
              onClick={testConnection}
              variant="outline"
              className="w-full"
              size="sm"
              disabled={loading}
            >
              🔗 연결 테스트
            </Button>
            
            {/* 계정 생성 버튼들 */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={() => createTestAccount('admin')}
                variant="outline"
                size="sm"
                disabled={loading}
                className="bg-red-50 hover:bg-red-100"
              >
                👑 관리자 생성
              </Button>
              <Button
                onClick={() => createTestAccount('user')}
                variant="outline"
                size="sm"
                disabled={loading}
                className="bg-blue-50 hover:bg-blue-100"
              >
                👤 사용자 생성
              </Button>
            </div>
            
            {/* 자동 입력 버튼들 */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={quickFillAdmin}
                variant="outline"
                size="sm"
                className="bg-orange-50 hover:bg-orange-100"
              >
                📝 관리자 입력
              </Button>
              <Button
                onClick={quickFillUser}
                variant="outline"
                size="sm"
                className="bg-green-50 hover:bg-green-100"
              >
                📝 사용자 입력
              </Button>
            </div>
            
            {/* 로그인 폼 */}
            <div className="space-y-3">
              <Input
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button
                onClick={simpleLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-green-600"
              >
                {loading ? '처리 중...' : '🚀 로그인 테스트'}
              </Button>
            </div>
            
            {/* 추천 계정 정보 */}
            <div className="space-y-3">
              <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-sm font-medium text-red-700 mb-2">
                  👑 관리자 계정
                </div>
                <div className="text-xs text-red-600 space-y-1">
                  <div>📧 admin@bulpae.com</div>
                  <div>🔑 admin123!</div>
                </div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm font-medium text-blue-700 mb-2">
                  👤 일반 사용자 계정
                </div>
                <div className="text-xs text-blue-600 space-y-1">
                  <div>📧 user@bulpae.com</div>
                  <div>🔑 user123!</div>
                </div>
              </div>
              
              <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                <div className="text-xs text-green-700 font-medium">
                  🎯 사용법: 계정 생성 → 자동 입력 → 로그인
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 디버그 정보 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">🔍 실시간 디버그 로그</CardTitle>
            <CardDescription>
              모든 과정이 실시간으로 표시됩니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={debugInfo}
              readOnly
              className="w-full h-96 p-3 text-xs font-mono bg-gray-900 text-green-400 rounded border resize-none"
              placeholder="여기에 실시간 로그가 표시됩니다..."
            />
            <Button
              onClick={() => setDebugInfo('')}
              variant="outline"
              size="sm"
              className="mt-2 w-full"
            >
              🗑️ 로그 지우기
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}