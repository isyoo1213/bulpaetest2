import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface DirectAuthProps {
  onAuthChange: (user: User | null) => void;
}

export default function DirectAuth({ onAuthChange }: DirectAuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // 테스트 계정 정보
  const testAccounts = {
    'admin@bulpae.com': {
      password: 'admin123!',
      user: {
        id: '11111111-1111-1111-1111-111111111111',
        email: 'admin@bulpae.com',
        user_metadata: {
          username: 'admin',
          full_name: '시스템 관리자'
        },
        app_metadata: {
          provider: 'direct',
          providers: ['direct']
        },
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString()
      } as User
    },
    'user@bulpae.com': {
      password: 'user123!',
      user: {
        id: '22222222-2222-2222-2222-222222222222',
        email: 'user@bulpae.com',
        user_metadata: {
          username: 'testuser',
          full_name: '테스트 사용자'
        },
        app_metadata: {
          provider: 'direct',
          providers: ['direct']
        },
        aud: 'authenticated',
        role: 'authenticated',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: new Date().toISOString(),
        last_sign_in_at: new Date().toISOString()
      } as User
    }
  };

  const directLogin = async () => {
    if (!email || !password) {
      toast({
        title: "❌ 입력 오류",
        description: "이메일과 비밀번호를 입력하세요.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // 테스트 계정 확인
      const account = testAccounts[email as keyof typeof testAccounts];
      
      if (!account) {
        toast({
          title: "❌ 계정 없음",
          description: "등록되지 않은 이메일입니다. 추천 계정을 사용해주세요.",
          variant: "destructive",
        });
        return;
      }

      if (account.password !== password) {
        toast({
          title: "❌ 비밀번호 오류",
          description: "비밀번호가 올바르지 않습니다.",
          variant: "destructive",
        });
        return;
      }

      // 로그인 성공
      toast({
        title: "🎉 로그인 성공!",
        description: `${account.user.user_metadata.full_name}님, 환영합니다!`,
      });

      // 사용자 정보를 localStorage에 저장 (세션 유지용)
      localStorage.setItem('directAuth_user', JSON.stringify(account.user));
      
      onAuthChange(account.user);

    } catch (error: any) {
      toast({
        title: "❌ 로그인 오류",
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
    toast({
      title: "📝 자동 입력",
      description: "관리자 계정 정보가 입력되었습니다.",
    });
  };

  const quickFillUser = () => {
    setEmail('user@bulpae.com');
    setPassword('user123!');
    toast({
      title: "📝 자동 입력",
      description: "일반 사용자 계정 정보가 입력되었습니다.",
    });
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            🚀 직접 로그인 시스템
          </CardTitle>
          <CardDescription>
            Auth 문제를 우회한 확실한 로그인 방법
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">

          {/* 자동 입력 버튼들 */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={quickFillAdmin}
              variant="outline"
              size="sm"
              className="bg-red-50 hover:bg-red-100"
            >
              👑 관리자 입력
            </Button>
            <Button
              onClick={quickFillUser}
              variant="outline"
              size="sm"
              className="bg-blue-50 hover:bg-blue-100"
            >
              👤 사용자 입력
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
              onClick={directLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600"
            >
              {loading ? '로그인 중...' : '🚀 바로 로그인'}
            </Button>
          </div>

          {/* 계정 정보 */}
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
            
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-sm font-medium text-green-700 mb-2">
                ✅ 불패 스터디 대시보드
              </div>
              <div className="text-xs text-green-600 space-y-1">
                <div>🏆 6개 팀 36명 완전한 테스트 환경</div>
                <div>📊 평가시스템, 그룹순위, 투자기록 완비</div>
                <div>🎯 사용자 가이드 평가체계 완전 반영</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}