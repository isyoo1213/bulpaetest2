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
    // 관리자 클라이언트 생성
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('테스트 계정 생성 시작...');

    // 테스트 계정 정보
    const testUsers = [
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

    for (const user of testUsers) {
      try {
        console.log(`사용자 생성 중: ${user.email}`);

        // 1. Auth 사용자 생성
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            username: user.username,
            full_name: user.full_name
          }
        });

        if (authError) {
          console.error(`Auth 오류 (${user.email}):`, authError);
          if (authError.message.includes('already registered')) {
            results.push({
              email: user.email,
              status: 'already_exists',
              message: '이미 존재하는 계정입니다'
            });
            continue;
          } else {
            throw authError;
          }
        }

        console.log(`Auth 사용자 생성 성공: ${authData.user.id}`);

        // 2. 프로필 생성
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('user_profiles_2025_09_27_12_14')
          .upsert({
            user_id: authData.user.id,
            username: user.username,
            full_name: user.full_name,
            initial_capital: 10000000,
            current_capital: 10000000
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        if (profileError) {
          console.error(`프로필 오류 (${user.email}):`, profileError);
          throw profileError;
        }

        console.log(`프로필 생성 성공: ${profile.id}`);

        results.push({
          email: user.email,
          password: user.password,
          username: user.username,
          full_name: user.full_name,
          status: 'created',
          user_id: authData.user.id,
          profile_id: profile.id
        });

      } catch (error) {
        console.error(`사용자 생성 실패 (${user.email}):`, error);
        results.push({
          email: user.email,
          status: 'error',
          error: error.message
        });
      }
    }

    // 3. 테스트 그룹 생성
    const adminProfile = results.find(r => r.username === 'admin' && r.status === 'created');
    if (adminProfile) {
      try {
        console.log('테스트 그룹 생성 중...');

        const { data: group, error: groupError } = await supabaseAdmin
          .from('study_groups_2025_09_27_12_14')
          .insert({
            name: '테스트 스터디 그룹',
            description: '시스템 테스트를 위한 샘플 그룹',
            leader_id: adminProfile.profile_id
          })
          .select()
          .single();

        if (groupError) {
          console.error('그룹 생성 오류:', groupError);
        } else {
          console.log(`그룹 생성 성공: ${group.id}`);

          // 4. 그룹 멤버십 추가
          const successfulUsers = results.filter(r => r.status === 'created');
          for (const user of successfulUsers) {
            await supabaseAdmin
              .from('group_memberships_2025_09_27_12_14')
              .upsert({
                group_id: group.id,
                user_id: user.profile_id
              }, {
                onConflict: 'group_id,user_id'
              });
          }

          // 5. 팀 설정 생성
          await supabaseAdmin
            .from('team_settings_2025_10_20_08_10')
            .upsert({
              group_id: group.id,
              team_color: '#3B82F6',
              team_slogan: '완벽한 시스템 테스트',
              team_goal: '새로운 평가시스템 테스트'
            }, {
              onConflict: 'group_id'
            });

          console.log('팀 설정 완료');
        }
      } catch (error) {
        console.error('그룹 설정 오류:', error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '테스트 계정 설정 완료',
        results: results,
        login_info: {
          admin: {
            email: 'admin@test.com',
            password: 'admin123!'
          },
          user: {
            email: 'user@test.com',
            password: 'user123!'
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