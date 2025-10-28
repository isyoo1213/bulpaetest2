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
    console.log('=== 6개 팀 및 36명 사용자 데이터 생성 시작 ===');
    
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

    // 팀 정보 정의
    const teams = [
      { name: '옵티머스팀', description: '최적화된 투자 전략으로 안정적 수익 추구', color: '#FF6B6B' },
      { name: '써밋팀', description: '정상을 향한 도전적 투자로 최고 수익률 달성', color: '#4ECDC4' },
      { name: '프론티어팀', description: '새로운 투자 영역 개척으로 혁신적 성과 창출', color: '#45B7D1' },
      { name: '모멘텀팀', description: '시장 모멘텀을 활용한 적극적 투자 전략', color: '#96CEB4' },
      { name: '아틀라스팀', description: '글로벌 시장 분석으로 세계적 투자 포트폴리오 구축', color: '#FFEAA7' },
      { name: '넥서스팀', description: '연결과 협력을 통한 시너지 투자 전략', color: '#DDA0DD' }
    ];

    // 각 팀별 멤버 이름 정의
    const teamMembers = {
      '옵티머스팀': ['김최적', '이효율', '박안정', '최수익', '정균형', '한신중'],
      '써밋팀': ['이정상', '박도전', '김성취', '최목표', '정열정', '한승리'],
      '프론티어팀': ['박개척', '김혁신', '이탐험', '최미래', '정창조', '한선구'],
      '모멘텀팀': ['김역동', '이추진', '박가속', '최활력', '정에너지', '한속도'],
      '아틀라스팀': ['이세계', '박글로벌', '김국제', '최대륙', '정지구', '한우주'],
      '넥서스팀': ['박연결', '김협력', '이소통', '최네트워크', '정시너지', '한융합']
    };

    const results = {
      teams_created: 0,
      users_created: 0,
      memberships_created: 0,
      activities_created: 0,
      portfolios_created: 0,
      errors: []
    };

    // 1. 기존 테스트 데이터 정리
    console.log('기존 테스트 데이터 정리 중...');
    
    // 기존 그룹 멤버십 삭제
    await supabaseAdmin
      .from('group_memberships_2025_09_27_12_14')
      .delete()
      .neq('id', 0); // 모든 데이터 삭제

    // 기존 그룹 삭제
    await supabaseAdmin
      .from('study_groups_2025_09_27_12_14')
      .delete()
      .neq('id', 0); // 모든 데이터 삭제

    // 기존 프로필 삭제 (admin, testuser 제외)
    await supabaseAdmin
      .from('user_profiles_2025_09_27_12_14')
      .delete()
      .not('username', 'in', '(admin,testuser)');

    console.log('기존 데이터 정리 완료');

    // 2. 각 팀별로 사용자 및 데이터 생성
    for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
      const team = teams[teamIndex];
      const members = teamMembers[team.name];
      
      console.log(`\n=== ${team.name} 생성 시작 ===`);

      // 팀 멤버 프로필 생성
      const teamProfiles = [];
      for (let memberIndex = 0; memberIndex < members.length; memberIndex++) {
        const memberName = members[memberIndex];
        const username = `${team.name.replace('팀', '').toLowerCase()}_${memberIndex + 1}`;
        const userId = `${(teamIndex + 1).toString().padStart(2, '0')}${(memberIndex + 1).toString().padStart(2, '0')}0000-0000-0000-0000-000000000000`;
        
        // 랜덤 투자 성과 생성 (800만원 ~ 1500만원)
        const currentCapital = Math.floor(Math.random() * 7000000) + 8000000;
        
        try {
          const { data: profile, error: profileError } = await supabaseAdmin
            .from('user_profiles_2025_09_27_12_14')
            .insert({
              user_id: userId,
              username: username,
              full_name: memberName,
              initial_capital: 10000000,
              current_capital: currentCapital,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (profileError) {
            console.error(`프로필 생성 오류 (${memberName}):`, profileError);
            results.errors.push(`프로필 생성 실패: ${memberName}`);
            continue;
          }

          teamProfiles.push(profile);
          results.users_created++;
          console.log(`프로필 생성: ${memberName} (${username})`);

        } catch (error) {
          console.error(`프로필 생성 예외 (${memberName}):`, error);
          results.errors.push(`프로필 생성 예외: ${memberName}`);
        }
      }

      // 팀 생성 (첫 번째 멤버를 리더로)
      if (teamProfiles.length > 0) {
        try {
          const { data: group, error: groupError } = await supabaseAdmin
            .from('study_groups_2025_09_27_12_14')
            .insert({
              name: team.name,
              description: team.description,
              leader_id: teamProfiles[0].id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single();

          if (groupError) {
            console.error(`그룹 생성 오류 (${team.name}):`, groupError);
            results.errors.push(`그룹 생성 실패: ${team.name}`);
            continue;
          }

          results.teams_created++;
          console.log(`그룹 생성: ${team.name}`);

          // 팀 설정 생성
          await supabaseAdmin
            .from('team_settings_2025_10_20_08_10')
            .insert({
              group_id: group.id,
              team_color: team.color,
              team_slogan: `${team.name} 화이팅!`,
              team_goal: team.description
            });

          // 그룹 멤버십 생성
          for (const profile of teamProfiles) {
            try {
              await supabaseAdmin
                .from('group_memberships_2025_09_27_12_14')
                .insert({
                  group_id: group.id,
                  user_id: profile.id,
                  joined_at: new Date().toISOString()
                });

              results.memberships_created++;
            } catch (error) {
              console.error(`멤버십 생성 오류:`, error);
            }
          }

          // 팀별 가상 투자 포트폴리오 생성
          const stocks = [
            { symbol: 'AAPL', name: 'Apple Inc.' },
            { symbol: 'TSLA', name: 'Tesla Inc.' },
            { symbol: 'NVDA', name: 'NVIDIA Corp.' },
            { symbol: 'MSFT', name: 'Microsoft Corp.' },
            { symbol: 'GOOGL', name: 'Alphabet Inc.' },
            { symbol: 'AMZN', name: 'Amazon.com Inc.' }
          ];

          for (let i = 0; i < 3; i++) { // 팀당 3개 종목
            const stock = stocks[i];
            const quantity = Math.floor(Math.random() * 50) + 10;
            const avgPrice = Math.floor(Math.random() * 200) + 100;
            const currentPrice = avgPrice + (Math.random() * 100 - 50);
            const totalValue = quantity * currentPrice;
            const profitLoss = quantity * (currentPrice - avgPrice);
            const profitLossPercentage = ((currentPrice - avgPrice) / avgPrice) * 100;

            try {
              await supabaseAdmin
                .from('team_portfolios_2025_09_27_13_30')
                .insert({
                  team_id: group.id,
                  stock_symbol: stock.symbol,
                  stock_name: stock.name,
                  quantity: quantity,
                  average_price: avgPrice,
                  current_price: currentPrice,
                  total_value: totalValue,
                  profit_loss: profitLoss,
                  profit_loss_percentage: profitLossPercentage,
                  last_updated: new Date().toISOString(),
                  created_at: new Date().toISOString()
                });

              results.portfolios_created++;
            } catch (error) {
              console.error(`포트폴리오 생성 오류:`, error);
            }
          }

          // 팀 멤버별 참여도 데이터 생성
          const activities = ['meeting_attendance', 'portfolio_update', 'research_sharing', 'discussion_participation', 'peer_feedback'];
          
          for (const profile of teamProfiles) {
            for (let day = 0; day < 7; day++) { // 최근 7일
              const activityDate = new Date();
              activityDate.setDate(activityDate.getDate() - day);
              
              const activity = activities[day % activities.length];
              const score = Math.floor(Math.random() * 10) + 8; // 8-17점

              try {
                await supabaseAdmin
                  .from('participation_records_2025_09_27_12_14')
                  .insert({
                    user_id: profile.id,
                    activity_type: activity,
                    activity_date: activityDate.toISOString().split('T')[0],
                    score: score,
                    description: `${team.name} ${activity === 'meeting_attendance' ? '팀 회의 참석' : 
                                 activity === 'portfolio_update' ? '포트폴리오 업데이트' :
                                 activity === 'research_sharing' ? '투자 리서치 공유' :
                                 activity === 'discussion_participation' ? '투자 토론 참여' : '동료 피드백 제공'}`,
                    created_at: new Date().toISOString()
                  });

                results.activities_created++;
              } catch (error) {
                // 중복 데이터 오류는 무시
                if (!error.message.includes('duplicate')) {
                  console.error(`참여도 생성 오류:`, error);
                }
              }
            }

            // 포인트 시스템 초기화
            try {
              await supabaseAdmin
                .from('user_points_2025_09_28_06_00')
                .insert({
                  user_id: profile.id,
                  current_points: Math.floor(Math.random() * 1000) + 500,
                  total_earned: Math.floor(Math.random() * 2000) + 1000,
                  total_spent: Math.floor(Math.random() * 500) + 100,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
            } catch (error) {
              // 포인트 오류는 무시
            }
          }

          console.log(`${team.name} 완료: 멤버 ${teamProfiles.length}명, 포트폴리오 3개, 활동 ${teamProfiles.length * 7}개`);

        } catch (error) {
          console.error(`팀 생성 예외 (${team.name}):`, error);
          results.errors.push(`팀 생성 예외: ${team.name}`);
        }
      }
    }

    console.log('\n=== 전체 데이터 생성 완료 ===');
    console.log('결과:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: '6개 팀 및 36명 사용자 데이터 생성 완료',
        results: results,
        teams: teams.map(t => t.name),
        summary: {
          total_teams: results.teams_created,
          total_users: results.users_created,
          total_memberships: results.memberships_created,
          total_activities: results.activities_created,
          total_portfolios: results.portfolios_created,
          errors_count: results.errors.length
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