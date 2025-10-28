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
    console.log('=== 테스트 계정 생성 시작 ===');
    
    // 관리자 클라이언트 생성
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Supabase URL:', Deno.env.get('SUPABASE_URL'));
    console.log('Service Role Key exists:', !!Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));

    // 테스트 계정 정보
    const testAccounts = [
      {
        email: 'admin@test.com',
        password: 'admin123!',
        username: 'admin',
        full_name: '시스템 관리자'
      },
      {
        email: 'user@test.com',
        password: 'user123!',
        username: 'testuser',
        full_name: '테스트 사용자'
      }
    ];

    const results = [];

    for (const account of testAccounts) {
      try {
        console.log(`\n--- ${account.email} 계정 생성 시작 ---`);

        // 1. 기존 사용자 확인
        const { data: existingUser } = await supabaseAdmin.auth.admin.getUserByEmail(account.email);
        
        if (existingUser.user) {
          console.log(`기존 사용자 발견: ${account.email}`);
          results.push({
            email: account.email,
            status: 'already_exists',
            message: '이미 존재하는 계정입니다',
            user_id: existingUser.user.id
          });
          continue;
        }

        // 2. 새 사용자 생성
        console.log(`새 사용자 생성 중: ${account.email}`);
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
          console.error(`Auth 생성 오류 (${account.email}):`, authError);
          results.push({
            email: account.email,
            status: 'auth_error',
            error: authError.message
          });
          continue;
        }

        console.log(`Auth 사용자 생성 성공: ${authData.user.id}`);

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
          console.error(`프로필 생성 오류 (${account.email}):`, profileError);
          results.push({
            email: account.email,
            status: 'profile_error',
            error: profileError.message,
            user_id: authData.user.id
          });
          continue;
        }

        console.log(`프로필 생성 성공: ${profile.id}`);

        // 4. 포인트 시스템 초기화
        console.log('포인트 시스템 초기화 중...');
        const { error: pointsError } = await supabaseAdmin
          .from('user_points_2025_09_28_06_00')
          .insert({
            user_id: profile.id,
            current_points: 1000,
            total_earned: 1000,
            total_spent: 0
          });

        if (pointsError) {
          console.log(`포인트 초기화 오류 (무시): ${pointsError.message}`);
        }

        results.push({
          email: account.email,
          password: account.password,
          username: account.username,
          full_name: account.full_name,
          status: 'created',
          user_id: authData.user.id,
          profile_id: profile.id
        });

        console.log(`${account.email} 계정 생성 완료!`);

      } catch (error) {
        console.error(`계정 생성 예외 (${account.email}):`, error);
        results.push({
          email: account.email,
          status: 'exception',
          error: error.message
        });
      }
    }

    // 5. 테스트 그룹 생성 (관리자가 있는 경우)
    const adminResult = results.find(r => r.username === 'admin' && r.status === 'created');
    if (adminResult) {
      try {
        console.log('\n--- 테스트 그룹 생성 ---');
        
        const { data: group, error: groupError } = await supabaseAdmin
          .from('study_groups_2025_09_27_12_14')
          .insert({
            name: '테스트 스터디 그룹',
            description: '시스템 테스트를 위한 샘플 그룹',
            leader_id: adminResult.profile_id
          })
          .select()
          .single();

        if (!groupError && group) {
          console.log(`그룹 생성 성공: ${group.id}`);

          // 모든 성공한 사용자를 그룹에 추가
          const successfulUsers = results.filter(r => r.status === 'created');
          for (const user of successfulUsers) {
            await supabaseAdmin
              .from('group_memberships_2025_09_27_12_14')
              .insert({
                group_id: group.id,
                user_id: user.profile_id
              });
          }

          // 팀 설정 생성
          await supabaseAdmin
            .from('team_settings_2025_10_20_08_10')
            .insert({
              group_id: group.id,
              team_color: '#3B82F6',
              team_slogan: '완벽한 시스템 테스트',
              team_goal: '새로운 평가시스템 테스트'
            });

          console.log('그룹 설정 완료');
        }
      } catch (groupError) {
        console.error('그룹 생성 오류:', groupError);
      }
    }

    console.log('\n=== 테스트 계정 생성 완료 ===');

    return new Response(
      JSON.stringify({
        success: true,
        message: '테스트 계정 생성 완료',
        results: results,
        summary: {
          total: results.length,
          created: results.filter(r => r.status === 'created').length,
          already_exists: results.filter(r => r.status === 'already_exists').length,
          errors: results.filter(r => r.status.includes('error')).length
        },
        login_instructions: {
          admin: {
            email: 'admin@test.com',
            password: 'admin123!',
            note: '관리자 권한으로 모든 기능 이용 가능'
          },
          user: {
            email: 'user@test.com',
            password: 'user123!',
            note: '일반 사용자 권한'
          }
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