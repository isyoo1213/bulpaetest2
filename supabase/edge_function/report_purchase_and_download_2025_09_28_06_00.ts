import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (req.method === 'POST' && action === 'purchase') {
      // 레포트 구매 처리
      const { reportId } = await req.json();

      // 사용자 프로필 조회
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles_2025_09_27_12_14')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) {
        return new Response(
          JSON.stringify({ error: 'User profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 레포트 정보 조회
      const { data: report } = await supabaseAdmin
        .from('reports_2025_09_28_06_00')
        .select('*')
        .eq('id', reportId)
        .eq('status', 'published')
        .single();

      if (!report) {
        return new Response(
          JSON.stringify({ error: 'Report not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 이미 구매했는지 확인
      const { data: existingPurchase } = await supabaseAdmin
        .from('report_purchases_2025_09_28_06_00')
        .select('id')
        .eq('report_id', reportId)
        .eq('buyer_id', userProfile.id)
        .single();

      if (existingPurchase) {
        return new Response(
          JSON.stringify({ error: 'Already purchased' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 무료 레포트인 경우
      if (report.price === 0) {
        // 구매 기록 생성
        const { data: purchase, error: purchaseError } = await supabaseAdmin
          .from('report_purchases_2025_09_28_06_00')
          .insert({
            report_id: reportId,
            buyer_id: userProfile.id,
            purchase_price: 0,
            payment_method: 'free',
            payment_status: 'completed'
          })
          .select()
          .single();

        if (purchaseError) {
          return new Response(
            JSON.stringify({ error: 'Failed to create purchase record' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: true, purchase }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 유료 레포트인 경우 포인트 확인
      const { data: userPoints } = await supabaseAdmin
        .from('user_points_2025_09_28_06_00')
        .select('current_points')
        .eq('user_id', userProfile.id)
        .single();

      if (!userPoints || userPoints.current_points < report.price) {
        return new Response(
          JSON.stringify({ error: 'Insufficient points' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 트랜잭션 시작 (구매 기록 생성, 포인트 차감, 포인트 거래 기록)
      const { data: purchase, error: purchaseError } = await supabaseAdmin
        .from('report_purchases_2025_09_28_06_00')
        .insert({
          report_id: reportId,
          buyer_id: userProfile.id,
          purchase_price: report.price,
          payment_method: 'points',
          payment_status: 'completed'
        })
        .select()
        .single();

      if (purchaseError) {
        return new Response(
          JSON.stringify({ error: 'Failed to create purchase record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 구매자 포인트 차감
      const { error: pointsError } = await supabaseAdmin
        .from('user_points_2025_09_28_06_00')
        .update({
          current_points: userPoints.current_points - report.price,
          total_spent: supabaseAdmin.sql`total_spent + ${report.price}`
        })
        .eq('user_id', userProfile.id);

      if (pointsError) {
        // 구매 기록 롤백
        await supabaseAdmin
          .from('report_purchases_2025_09_28_06_00')
          .delete()
          .eq('id', purchase.id);

        return new Response(
          JSON.stringify({ error: 'Failed to deduct points' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 구매자 포인트 거래 기록
      await supabaseAdmin
        .from('point_transactions_2025_09_28_06_00')
        .insert({
          user_id: userProfile.id,
          transaction_type: 'spend',
          amount: -report.price,
          description: `${report.title} 레포트 구매`,
          reference_type: 'report_purchase',
          reference_id: purchase.id
        });

      // 판매자 포인트 적립 (90%, 10%는 수수료)
      const sellerEarning = Math.floor(report.price * 0.9);
      
      const { error: sellerPointsError } = await supabaseAdmin
        .from('user_points_2025_09_28_06_00')
        .update({
          current_points: supabaseAdmin.sql`current_points + ${sellerEarning}`,
          total_earned: supabaseAdmin.sql`total_earned + ${sellerEarning}`
        })
        .eq('user_id', report.author_id);

      if (!sellerPointsError) {
        // 판매자 포인트 거래 기록
        await supabaseAdmin
          .from('point_transactions_2025_09_28_06_00')
          .insert({
            user_id: report.author_id,
            transaction_type: 'earn',
            amount: sellerEarning,
            description: `${report.title} 레포트 판매 수익`,
            reference_type: 'report_sale',
            reference_id: purchase.id
          });
      }

      // 레포트 다운로드 수 증가
      await supabaseAdmin
        .from('reports_2025_09_28_06_00')
        .update({
          download_count: supabaseAdmin.sql`download_count + 1`
        })
        .eq('id', reportId);

      return new Response(
        JSON.stringify({ success: true, purchase }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (req.method === 'GET' && action === 'download') {
      // PDF 다운로드 처리
      const reportId = url.searchParams.get('reportId');

      if (!reportId) {
        return new Response(
          JSON.stringify({ error: 'Report ID required' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 사용자 프로필 조회
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles_2025_09_27_12_14')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!userProfile) {
        return new Response(
          JSON.stringify({ error: 'User profile not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 레포트 정보 조회
      const { data: report } = await supabaseAdmin
        .from('reports_2025_09_28_06_00')
        .select('*')
        .eq('id', reportId)
        .eq('status', 'published')
        .single();

      if (!report) {
        return new Response(
          JSON.stringify({ error: 'Report not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // 구매 여부 확인 (무료 레포트이거나 구매한 레포트)
      if (report.price > 0) {
        const { data: purchase } = await supabaseAdmin
          .from('report_purchases_2025_09_28_06_00')
          .select('id')
          .eq('report_id', reportId)
          .eq('buyer_id', userProfile.id)
          .eq('payment_status', 'completed')
          .single();

        if (!purchase) {
          return new Response(
            JSON.stringify({ error: 'Purchase required' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // 다운로드 기록 업데이트
        await supabaseAdmin
          .from('report_purchases_2025_09_28_06_00')
          .update({
            downloaded_at: new Date().toISOString(),
            download_count: supabaseAdmin.sql`download_count + 1`
          })
          .eq('id', purchase.id);
      }

      // PDF 생성 (실제로는 레포트 내용을 PDF로 변환)
      const pdfContent = generatePDF(report);
      
      return new Response(pdfContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${report.title}.pdf"`
        }
      });

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid request' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// PDF 생성 함수 (간단한 텍스트 기반 PDF)
function generatePDF(report: any): Uint8Array {
  // 실제 환경에서는 jsPDF나 다른 PDF 라이브러리를 사용해야 합니다.
  // 여기서는 간단한 텍스트 기반 PDF를 시뮬레이션합니다.
  
  const pdfHeader = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${report.content?.length || 0}
>>
stream
BT
/F1 12 Tf
50 750 Td
(${report.title}) Tj
0 -20 Td
(${report.description}) Tj
0 -40 Td
`;

  const pdfContent = report.content?.replace(/\n/g, ') Tj 0 -15 Td (') || '';
  
  const pdfFooter = `) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000173 00000 n 
0000000301 00000 n 
0000000380 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
456
%%EOF`;

  const fullPdf = pdfHeader + pdfContent + pdfFooter;
  return new TextEncoder().encode(fullPdf);
}