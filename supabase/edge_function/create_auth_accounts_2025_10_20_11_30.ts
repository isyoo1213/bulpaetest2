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
    console.log('=== 36명 Auth 계정 생성 시작 ===');
    
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

    // 팀별 계정 정보 정의
    const teamAccounts = {
      '옵티머스팀': [
        { email: 'kim.optimal@bulpae.com', password: 'optimal123!', name: '김최적', username: 'kim_optimal' },
        { email: 'lee.efficient@bulpae.com', password: 'efficient123!', name: '이효율', username: 'lee_efficient' },
        { email: 'park.stable@bulpae.com', password: 'stable123!', name: '박안정', username: 'park_stable' },
        { email: 'choi.profit@bulpae.com', password: 'profit123!', name: '최수익', username: 'choi_profit' },
        { email: 'jung.balance@bulpae.com', password: 'balance123!', name: '정균형', username: 'jung_balance' },
        { email: 'han.careful@bulpae.com', password: 'careful123!', name: '한신중', username: 'han_careful' }
      ],
      '써밋팀': [
        { email: 'lee.summit@bulpae.com', password: 'summit123!', name: '이정상', username: 'lee_summit' },
        { email: 'park.challenge@bulpae.com', password: 'challenge123!', name: '박도전', username: 'park_challenge' },
        { email: 'kim.achieve@bulpae.com', password: 'achieve123!', name: '김성취', username: 'kim_achieve' },
        { email: 'choi.goal@bulpae.com', password: 'goal123!', name: '최목표', username: 'choi_goal' },
        { email: 'jung.passion@bulpae.com', password: 'passion123!', name: '정열정', username: 'jung_passion' },
        { email: 'han.victory@bulpae.com', password: 'victory123!', name: '한승리', username: 'han_victory' }
      ],
      '프론티어팀': [
        { email: 'park.pioneer@bulpae.com', password: 'pioneer123!', name: '박개척', username: 'park_pioneer' },
        { email: 'kim.innovation@bulpae.com', password: 'innovation123!', name: '김혁신', username: 'kim_innovation' },
        { email: 'lee.explore@bulpae.com', password: 'explore123!', name: '이탐험', username: 'lee_explore' },
        { email: 'choi.future@bulpae.com', password: 'future123!', name: '최미래', username: 'choi_future' },
        { email: 'jung.create@bulpae.com', password: 'create123!', name: '정창조', username: 'jung_create' },
        { email: 'han.advance@bulpae.com', password: 'advance123!', name: '한선구', username: 'han_advance' }
      ],
      '모멘텀팀': [
        { email: 'kim.dynamic@bulpae.com', password: 'dynamic123!', name: '김역동', username: 'kim_dynamic' },
        { email: 'lee.drive@bulpae.com', password: 'drive123!', name: '이추진', username: 'lee_drive' },
        { email: 'park.speed@bulpae.com', password: 'speed123!', name: '박가속', username: 'park_speed' },
        { email: 'choi.energy@bulpae.com', password: 'energy123!', name: '최활력', username: 'choi_energy' },
        { email: 'jung.power@bulpae.com', password: 'power123!', name: '정에너지', username: 'jung_power' },
        { email: 'han.velocity@bulpae.com', password: 'velocity123!', name: '한속도', username: 'han_velocity' }
      ],
      '아틀라스팀': [
        { email: 'lee.world@bulpae.com', password: 'world123!', name: '이세계', username: 'lee_world' },
        { email: 'park.global@bulpae.com', password: 'global123!', name: '박글로벌', username: 'park_global' },
        { email: 'kim.international@bulpae.com', password: 'international123!', name: '김국제', username: 'kim_international' },
        { email: 'choi.continent@bulpae.com', password: 'continent123!', name: '최대륙', username: 'choi_continent' },
        { email: 'jung.earth@bulpae.com', password: 'earth123!', name: '정지구', username: 'jung_earth' },
        { email: 'han.universe@bulpae.com', password: 'universe123!', name: '한우주', username: 'han_universe' }
      ],
      '넥서스팀': [
        { email: 'park.connect@bulpae.com', password: 'connect123!', name: '박연결', username: 'park_connect' },
        { email: 'kim.cooperate@bulpae.com', password: 'cooperate123!', name: '김협력', username: 'kim_cooperate' },
        { email: 'lee.communicate@bulpae.com', password: 'communicate123!', name: '이소통', username: 'lee_communicate' },
        { email: 'choi.network@bulpae.com', password: 'network123!', name: '최네트워크', username: 'choi_network' },
        { email: 'jung.synergy@bulpae.com', password: 'synergy123!', name: '정시너지', username: 'jung_synergy' },
        { email: 'han.fusion@bulpae.com', password: 'fusion123!', name: '한융합', username: 'han_fusion' }
      ]
    };

    const results = {
      accounts_created: 0,
      profiles_updated: 0,
      errors: [],
      login_info: []
    };

    // 각 팀별로 Auth 계정 생성
    for (const [teamName, members] of Object.entries(teamAccounts)) {
      console.log(`\n=== ${teamName} Auth 계정 생성 ===`);
      
      for (const member of members) {
        try {
          // 1. Auth 사용자 생성
          const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: member.email,
            password: member.password,
            email_confirm: true, // 이메일 인증 자동 완료
            user_metadata: {
              username: member.username,
              full_name: member.name,
              team: teamName
            }
          });

          if (authError) {
            if (authError.message.includes('already registered')) {
              console.log(`이미 존재하는 계정: ${member.email}`);
              results.login_info.push({
                team: teamName,
                name: member.name,
                email: member.email,
                password: member.password,
                username: member.username,
                status: 'already_exists'
              });
            } else {
              console.error(`Auth 생성 오류 (${member.name}):`, authError);
              results.errors.push(`${member.name}: ${authError.message}`);
            }
            continue;
          }

          console.log(`Auth 계정 생성 성공: ${member.name} (${member.email})`);
          results.accounts_created++;

          // 2. 기존 프로필과 연결 (username 기준)
          const { data: existingProfile } = await supabaseAdmin
            .from('user_profiles_2025_09_27_12_14')
            .select('*')
            .eq('full_name', member.name)
            .single();

          if (existingProfile) {
            // 프로필의 user_id를 새로 생성된 Auth 사용자 ID로 업데이트
            const { error: updateError } = await supabaseAdmin
              .from('user_profiles_2025_09_27_12_14')
              .update({
                user_id: authData.user.id,
                username: member.username,
                updated_at: new Date().toISOString()
              })
              .eq('id', existingProfile.id);

            if (updateError) {
              console.error(`프로필 업데이트 오류 (${member.name}):`, updateError);
              results.errors.push(`${member.name} 프로필 업데이트 실패`);
            } else {
              console.log(`프로필 연결 완료: ${member.name}`);
              results.profiles_updated++;
            }
          }

          // 로그인 정보 저장
          results.login_info.push({
            team: teamName,
            name: member.name,
            email: member.email,
            password: member.password,
            username: member.username,
            status: 'created'
          });

        } catch (error) {
          console.error(`계정 생성 예외 (${member.name}):`, error);
          results.errors.push(`${member.name}: ${error.message}`);
        }
      }
    }

    console.log('\n=== Auth 계정 생성 완료 ===');
    console.log(`생성된 계정: ${results.accounts_created}개`);
    console.log(`업데이트된 프로필: ${results.profiles_updated}개`);
    console.log(`오류: ${results.errors.length}개`);

    return new Response(
      JSON.stringify({
        success: true,
        message: '36명 Auth 계정 생성 완료',
        results: results,
        summary: {
          total_accounts: results.accounts_created,
          total_profiles_updated: results.profiles_updated,
          total_errors: results.errors.length
        },
        teams: Object.keys(teamAccounts)
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