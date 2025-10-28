import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== 관리자 권한으로 테스트 계정 생성 시작 ===');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Supabase 환경 변수가 설정되지 않았습니다');
    }
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Service Role Key 존재:', !!serviceRoleKey);

    // 관리자 클라이언트 생성
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    const { accountType } = await req.json();
    
    // 계정 정보 설정
    const accounts = {
      admin: {
        email: 'admin@bulpae.com',
        password: 'admin123!',
        username: 'admin',
        full_name: '시스템 관리자'
      },
      user: {
        email: 'user@bulpae.com', 
        password: 'user123!',
        username: 'testuser',
        full_name: '테스트 사용자'
      }
    };
    
    const account = accounts[accountType as keyof typeof accounts];
    if (!account) {
      throw new Error('잘못된 계정 타입입니다');
    }
    
    console.log(`${accountType} 계정 생성 시도:`, account.email);

    // 1. 기존 사용자 확인
    const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(account.email);
    
    if (existingUser.user) {
      console.log('기존 사용자 발견:', account.email);
      
      // 기존 사용자의 프로필 확인
      const { data: profile } = await supabaseAdmin
        .from('user_profiles_2025_09_27_12_14')
        .select('*')
        .eq('user_id', existingUser.user.id)
        .single();
      
      return new Response(
        JSON.stringify({
          success: true,
          message: '계정이 이미 존재합니다',
          account: {
            email: account.email,
            password: account.password,
            user_id: existingUser.user.id,
            profile_exists: !!profile
          }
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // 2. 새 사용자 생성 (관리자 권한)
    console.log('새 사용자 생성 중...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true, // 이메일 인증 자동 완료
      user_metadata: {
        username: account.username,
        full_name: account.full_name
      }
    });

    if (authError) {
      console.error('Auth 사용자 생성 실패:', authError);
      throw new Error(`Auth 사용자 생성 실패: ${authError.message}`);
    }

    console.log('Auth 사용자 생성 성공:', authData.user.id);

    // 3. 사용자 프로필 생성
    console.log('사용자 프로필 생성 중...');
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles_2025_09_27_12_14')
      .insert({
        user_id: authData.user.id,
        username: account.username,
        full_name: account.full_name,
        initial_capital: 10000000,
        current_capital: 10000000
      })
      .select()
      .single();

    if (profileError) {
      console.error('프로필 생성 실패:', profileError);
      // Auth 사용자는 생성되었으므로 계속 진행
    } else {
      console.log('프로필 생성 성공:', profile.id);
    }

    // 4. 포인트 시스템 초기화 (선택사항)
    if (profile) {
      try {
        await supabaseAdmin
          .from('user_points_2025_09_28_06_00')
          .insert({
            user_id: profile.id,
            current_points: 1000,
            total_earned: 1000,
            total_spent: 0
          });
        console.log('포인트 시스템 초기화 완료');
      } catch (pointsError) {
        console.log('포인트 초기화 실패 (무시):', pointsError);
      }
    }

    // 5. 로그인 토큰 생성
    console.log('로그인 토큰 생성 중...');
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: account.email
    });

    if (sessionError) {
      console.error('세션 생성 실패:', sessionError);
    } else {
      console.log('세션 생성 성공');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '테스트 계정 생성 완료',
        account: {
          email: account.email,
          password: account.password,
          username: account.username,
          full_name: account.full_name,
          user_id: authData.user.id,
          profile_id: profile?.id,
          session_url: sessionData?.properties?.action_link
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('전체 프로세스 오류:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});