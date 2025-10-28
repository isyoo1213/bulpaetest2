import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, X-Client-Info, apikey, Content-Type, X-Application-Name',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 테스트용 사용자 생성
    const testUsers = [
      { email: 'kim@bulpae.com', password: 'test123!', username: 'investor_kim', full_name: '김투자' },
      { email: 'lee@bulpae.com', password: 'test123!', username: 'trader_lee', full_name: '이트레이더' },
      { email: 'park@bulpae.com', password: 'test123!', username: 'stock_park', full_name: '박주식' },
      { email: 'choi@bulpae.com', password: 'test123!', username: 'value_choi', full_name: '최가치' },
      { email: 'jung@bulpae.com', password: 'test123!', username: 'growth_jung', full_name: '정성장' }
    ];

    const createdUsers = [];

    // 사용자 생성
    for (const userData of testUsers) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true
      });

      if (authError) {
        console.error('사용자 생성 오류:', authError);
        continue;
      }

      createdUsers.push({
        ...userData,
        user_id: authData.user.id
      });
    }

    // 사용자 프로필 생성
    const profiles = [
      { user_id: createdUsers[0]?.user_id, username: 'investor_kim', full_name: '김투자', initial_capital: 10000000, current_capital: 11500000, total_return_rate: 15.0, participation_score: 850, level: 3 },
      { user_id: createdUsers[1]?.user_id, username: 'trader_lee', full_name: '이트레이더', initial_capital: 10000000, current_capital: 9200000, total_return_rate: -8.0, participation_score: 720, level: 2 },
      { user_id: createdUsers[2]?.user_id, username: 'stock_park', full_name: '박주식', initial_capital: 10000000, current_capital: 12800000, total_return_rate: 28.0, participation_score: 1200, level: 4 },
      { user_id: createdUsers[3]?.user_id, username: 'value_choi', full_name: '최가치', initial_capital: 10000000, current_capital: 10300000, total_return_rate: 3.0, participation_score: 650, level: 2 },
      { user_id: createdUsers[4]?.user_id, username: 'growth_jung', full_name: '정성장', initial_capital: 10000000, current_capital: 13200000, total_return_rate: 32.0, participation_score: 950, level: 5 }
    ];

    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles_2025_09_27_12_14')
      .insert(profiles.filter(p => p.user_id))
      .select();

    if (profileError) {
      throw new Error(`프로필 생성 오류: ${profileError.message}`);
    }

    // 스터디 그룹 생성
    const { data: groupData, error: groupError } = await supabase
      .from('study_groups_2025_09_27_12_14')
      .insert([
        { name: '불패 A팀', description: '공격적 성장주 투자 그룹', leader_id: profileData[2]?.id, max_members: 10, current_members: 3, group_score: 14.0 },
        { name: '불패 B팀', description: '안정적 가치투자 그룹', leader_id: profileData[0]?.id, max_members: 10, current_members: 2, group_score: 6.7 }
      ])
      .select();

    if (groupError) {
      throw new Error(`그룹 생성 오류: ${groupError.message}`);
    }

    // 그룹 멤버십 생성
    const { error: membershipError } = await supabase
      .from('group_memberships_2025_09_27_12_14')
      .insert([
        { user_id: profileData[0]?.id, group_id: groupData[1]?.id, role: 'leader' },
        { user_id: profileData[1]?.id, group_id: groupData[0]?.id, role: 'member' },
        { user_id: profileData[2]?.id, group_id: groupData[0]?.id, role: 'leader' },
        { user_id: profileData[3]?.id, group_id: groupData[1]?.id, role: 'member' },
        { user_id: profileData[4]?.id, group_id: groupData[0]?.id, role: 'member' }
      ]);

    if (membershipError) {
      throw new Error(`멤버십 생성 오류: ${membershipError.message}`);
    }

    // 투자 기록 생성
    const investmentRecords = [
      // 김투자의 투자 기록
      { user_id: profileData[0]?.id, stock_code: '005930', stock_name: '삼성전자', transaction_type: 'buy', quantity: 20, price: 75000, total_amount: 1500000, transaction_date: '2024-01-15', notes: '반도체 업황 회복 기대' },
      { user_id: profileData[0]?.id, stock_code: '000660', stock_name: 'SK하이닉스', transaction_type: 'buy', quantity: 10, price: 120000, total_amount: 1200000, transaction_date: '2024-01-20', notes: 'AI 메모리 수요 증가' },
      { user_id: profileData[0]?.id, stock_code: '035420', stock_name: 'NAVER', transaction_type: 'buy', quantity: 5, price: 200000, total_amount: 1000000, transaction_date: '2024-02-01', notes: '플랫폼 사업 확장' },
      
      // 박주식의 투자 기록
      { user_id: profileData[2]?.id, stock_code: '207940', stock_name: '삼성바이오로직스', transaction_type: 'buy', quantity: 2, price: 800000, total_amount: 1600000, transaction_date: '2024-01-05', notes: '바이오 대장주' },
      { user_id: profileData[2]?.id, stock_code: '068270', stock_name: '셀트리온', transaction_type: 'buy', quantity: 8, price: 180000, total_amount: 1440000, transaction_date: '2024-01-25', notes: '바이오시밀러 시장 확대' },
      
      // 정성장의 투자 기록
      { user_id: profileData[4]?.id, stock_code: '035720', stock_name: '카카오', transaction_type: 'buy', quantity: 8, price: 90000, total_amount: 720000, transaction_date: '2024-01-08', notes: '플랫폼 회복 기대' },
      { user_id: profileData[4]?.id, stock_code: '251270', stock_name: '넷마블', transaction_type: 'buy', quantity: 15, price: 65000, total_amount: 975000, transaction_date: '2024-01-22', notes: '게임 신작 출시' }
    ];

    const { error: recordError } = await supabase
      .from('investment_records_2025_09_27_12_14')
      .insert(investmentRecords.filter(r => r.user_id));

    if (recordError) {
      throw new Error(`투자 기록 생성 오류: ${recordError.message}`);
    }

    // 투자 아이디어 생성
    const { data: ideaData, error: ideaError } = await supabase
      .from('investment_ideas_2025_09_27_12_14')
      .insert([
        {
          user_id: profileData[2]?.id,
          group_id: groupData[0]?.id,
          title: '삼성바이오로직스 매수 추천',
          content: '글로벌 바이오의약품 위탁생산(CMO) 시장이 지속 성장하고 있습니다. 삼성바이오로직스는 세계 3위 규모의 생산능력을 보유하고 있으며, 4공장 완공으로 더욱 확장될 예정입니다.',
          stock_code: '207940',
          stock_name: '삼성바이오로직스',
          target_price: 1000000,
          likes_count: 3,
          comments_count: 2
        },
        {
          user_id: profileData[0]?.id,
          group_id: groupData[1]?.id,
          title: 'NAVER 플랫폼 사업 전망',
          content: '네이버의 검색광고 매출이 안정적이고, 웹툰/웹소설 등 콘텐츠 사업도 성장하고 있습니다. 특히 해외 진출이 가속화되면서 성장 동력이 다각화되고 있어 중장기 투자 관점에서 매력적입니다.',
          stock_code: '035420',
          stock_name: 'NAVER',
          target_price: 250000,
          likes_count: 5,
          comments_count: 3
        }
      ])
      .select();

    if (ideaError) {
      throw new Error(`아이디어 생성 오류: ${ideaError.message}`);
    }

    // 댓글 생성
    if (ideaData && ideaData.length > 0) {
      const { error: commentError } = await supabase
        .from('comments_2025_09_27_12_14')
        .insert([
          { user_id: profileData[0]?.id, idea_id: ideaData[0]?.id, content: '동의합니다! CMO 시장 성장성이 매우 좋네요.' },
          { user_id: profileData[4]?.id, idea_id: ideaData[0]?.id, content: '4공장 완공 시점을 잘 지켜봐야겠어요.' },
          { user_id: profileData[2]?.id, idea_id: ideaData[1]?.id, content: '웹툰 사업 해외 진출이 인상적이네요!' }
        ]);

      if (commentError) {
        console.error('댓글 생성 오류:', commentError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: '샘플 데이터가 성공적으로 생성되었습니다!',
        users: createdUsers.map(u => ({ email: u.email, password: u.password, name: u.full_name })),
        profiles_created: profileData?.length || 0,
        groups_created: groupData?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('샘플 데이터 생성 오류:', error);
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