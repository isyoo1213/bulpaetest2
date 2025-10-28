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
    console.log('=== 가상 데이터 생성 시작 ===');
    
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

    // 1. 기존 사용자 프로필 확인
    const { data: existingProfiles } = await supabaseAdmin
      .from('user_profiles_2025_09_27_12_14')
      .select('*')
      .in('username', ['admin', 'testuser']);

    console.log('기존 프로필:', existingProfiles?.length || 0);

    // 2. 프로필 데이터 업데이트
    if (existingProfiles && existingProfiles.length > 0) {
      for (const profile of existingProfiles) {
        await supabaseAdmin
          .from('user_profiles_2025_09_27_12_14')
          .update({
            initial_capital: 10000000,
            current_capital: profile.username === 'admin' ? 12500000 : 11200000,
            updated_at: new Date().toISOString()
          })
          .eq('id', profile.id);
      }
      console.log('프로필 업데이트 완료');
    }

    // 3. 가상 스터디 그룹 생성
    const adminProfile = existingProfiles?.find(p => p.username === 'admin');
    if (adminProfile) {
      const { data: existingGroup } = await supabaseAdmin
        .from('study_groups_2025_09_27_12_14')
        .select('*')
        .eq('name', '불패 테스트팀')
        .single();

      let groupId;
      if (!existingGroup) {
        const { data: newGroup, error: groupError } = await supabaseAdmin
          .from('study_groups_2025_09_27_12_14')
          .insert({
            name: '불패 테스트팀',
            description: '테스트용 스터디 그룹 - 공격적 성장 투자 전략',
            leader_id: adminProfile.id
          })
          .select()
          .single();

        if (groupError) {
          console.error('그룹 생성 오류:', groupError);
        } else {
          groupId = newGroup.id;
          console.log('새 그룹 생성:', groupId);
        }
      } else {
        groupId = existingGroup.id;
        console.log('기존 그룹 사용:', groupId);
      }

      // 4. 그룹 멤버십 생성
      if (groupId && existingProfiles) {
        for (const profile of existingProfiles) {
          const { error: membershipError } = await supabaseAdmin
            .from('group_memberships_2025_09_27_12_14')
            .upsert({
              group_id: groupId,
              user_id: profile.id,
              joined_at: new Date().toISOString()
            });

          if (membershipError) {
            console.log('멤버십 오류 (무시):', membershipError.message);
          }
        }
        console.log('그룹 멤버십 설정 완료');
      }
    }

    // 5. 가상 투자 데이터 생성 (간단한 형태)
    const sampleStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 2.5 },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.80, change: -1.2 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 520.75, change: 15.3 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 380.90, change: 3.8 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.65, change: -0.5 }
    ];

    // 6. 가상 참여도 데이터 생성
    if (existingProfiles) {
      const activities = [
        'meeting_attendance',
        'portfolio_update', 
        'research_sharing',
        'discussion_participation',
        'peer_feedback'
      ];

      for (const profile of existingProfiles) {
        // 최근 5일간의 활동 생성
        for (let i = 0; i < 5; i++) {
          const activityDate = new Date();
          activityDate.setDate(activityDate.getDate() - i);
          
          const activity = activities[i % activities.length];
          const score = Math.floor(Math.random() * 10) + 8; // 8-17점

          // 기존 기록이 있는지 확인
          const { data: existingActivity } = await supabaseAdmin
            .from('participation_records_2025_09_27_12_14')
            .select('*')
            .eq('user_id', profile.id)
            .eq('activity_date', activityDate.toISOString().split('T')[0])
            .single();

          if (!existingActivity) {
            const { error: activityError } = await supabaseAdmin
              .from('participation_records_2025_09_27_12_14')
              .insert({
                user_id: profile.id,
                activity_type: activity,
                activity_date: activityDate.toISOString().split('T')[0],
                score: score,
                description: `${activity === 'meeting_attendance' ? '회의 참석' : 
                             activity === 'portfolio_update' ? '포트폴리오 업데이트' :
                             activity === 'research_sharing' ? '리서치 공유' :
                             activity === 'discussion_participation' ? '토론 참여' : '피드백 제공'}`
              });

            if (activityError) {
              console.log('참여도 기록 오류 (무시):', activityError.message);
            }
          }
        }
      }
      console.log('참여도 데이터 생성 완료');
    }

    // 7. 포인트 시스템 초기화
    if (existingProfiles) {
      for (const profile of existingProfiles) {
        const { error: pointsError } = await supabaseAdmin
          .from('user_points_2025_09_28_06_00')
          .upsert({
            user_id: profile.id,
            current_points: profile.username === 'admin' ? 1500 : 1200,
            total_earned: profile.username === 'admin' ? 2000 : 1800,
            total_spent: profile.username === 'admin' ? 500 : 600,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (pointsError) {
          console.log('포인트 오류 (무시):', pointsError.message);
        }
      }
      console.log('포인트 시스템 초기화 완료');
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '가상 데이터 생성 완료',
        data: {
          profiles_updated: existingProfiles?.length || 0,
          sample_stocks: sampleStocks,
          activities_created: existingProfiles ? existingProfiles.length * 5 : 0,
          points_initialized: existingProfiles?.length || 0
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('가상 데이터 생성 오류:', error);
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