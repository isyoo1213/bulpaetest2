import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Supabase 관리자 클라이언트 생성
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

    // 일반 클라이언트 (RLS 적용)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const testAccounts = [
      {
        email: 'admin@test.com',
        password: 'admin123!',
        username: 'admin',
        full_name: '시스템 관리자',
        role: 'admin'
      },
      {
        email: 'user@test.com',
        password: 'user123!',
        username: 'testuser',
        full_name: '테스트 사용자',
        role: 'member'
      },
      {
        email: 'member1@test.com',
        password: 'member123!',
        username: 'member1',
        full_name: '김투자',
        role: 'member'
      },
      {
        email: 'member2@test.com',
        password: 'member123!',
        username: 'member2',
        full_name: '이분석',
        role: 'member'
      },
      {
        email: 'member3@test.com',
        password: 'member123!',
        username: 'member3',
        full_name: '박전략',
        role: 'member'
      },
      {
        email: 'member4@test.com',
        password: 'member123!',
        username: 'member4',
        full_name: '최리스크',
        role: 'member'
      }
    ];

    const createdUsers = [];

    // 각 테스트 계정 생성
    for (const account of testAccounts) {
      try {
        // 1. Auth 사용자 생성
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: account.password,
          email_confirm: true,
          user_metadata: {
            username: account.username,
            full_name: account.full_name
          }
        });

        if (authError) {
          console.error(`Auth 사용자 생성 실패 (${account.email}):`, authError);
          continue;
        }

        // 2. 사용자 프로필 생성
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('user_profiles_2025_09_27_12_14')
          .insert({
            user_id: authUser.user.id,
            username: account.username,
            full_name: account.full_name,
            initial_capital: 10000000,
            current_capital: 10000000
          })
          .select()
          .single();

        if (profileError) {
          console.error(`프로필 생성 실패 (${account.email}):`, profileError);
          continue;
        }

        createdUsers.push({
          email: account.email,
          password: account.password,
          username: account.username,
          full_name: account.full_name,
          role: account.role,
          user_id: authUser.user.id,
          profile_id: profile.id
        });

      } catch (error) {
        console.error(`계정 생성 중 오류 (${account.email}):`, error);
      }
    }

    // 3. 테스트 그룹 생성 (관리자가 리더)
    const adminUser = createdUsers.find(u => u.role === 'admin');
    if (adminUser) {
      const { data: group, error: groupError } = await supabaseAdmin
        .from('study_groups_2025_09_27_12_14')
        .insert({
          name: '테스트 스터디 그룹',
          description: '시스템 테스트를 위한 샘플 그룹입니다',
          leader_id: adminUser.profile_id
        })
        .select()
        .single();

      if (!groupError && group) {
        // 4. 모든 사용자를 그룹에 추가
        const memberships = createdUsers.map(user => ({
          group_id: group.id,
          user_id: user.profile_id
        }));

        await supabaseAdmin
          .from('group_memberships_2025_09_27_12_14')
          .insert(memberships);

        // 5. 팀 설정 생성
        await supabaseAdmin
          .from('team_settings_2025_10_20_08_10')
          .insert({
            group_id: group.id,
            team_color: '#3B82F6',
            team_slogan: '완벽한 시스템 테스트',
            team_goal: '새로운 평가시스템의 모든 기능을 완벽하게 테스트하여 최고의 사용자 경험을 제공합니다'
          });

        // 6. 포인트 시스템 초기화
        const pointsData = createdUsers.map(user => ({
          user_id: user.profile_id,
          current_points: 1000,
          total_earned: 1000,
          total_spent: 0
        }));

        await supabaseAdmin
          .from('user_points_2025_09_28_06_00')
          .insert(pointsData);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '테스트 계정이 성공적으로 생성되었습니다',
        accounts: createdUsers.map(user => ({
          email: user.email,
          password: user.password,
          username: user.username,
          full_name: user.full_name,
          role: user.role
        }))
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('테스트 계정 생성 오류:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});