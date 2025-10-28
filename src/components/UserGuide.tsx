import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BookOpen, 
  Crown, 
  Search, 
  BarChart3, 
  Shield, 
  Edit, 
  Users, 
  TrendingUp, 
  Award, 
  Calculator, 
  Calendar, 
  RotateCw,
  Target,
  Info,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Star,
  Clock,
  Activity,
  FileText,
  Coins,
  Settings
} from 'lucide-react';

export default function UserGuide() {
  const [activeSection, setActiveSection] = useState('overview');

  const roles = [
    {
      key: 'strategy_leader',
      name: '전략리더',
      icon: Crown,
      color: 'text-yellow-600 bg-yellow-100',
      description: '팀의 투자 방향성을 제시하고 의사결정을 이끄는 역할',
      responsibilities: [
        '이번 2주 무엇을 볼지 핵심 질문 1~3개 제시 (금리/환율/섹터 등)',
        '팀 토론 진행 및 최종 투자 결정 책임',
        '투자 전략 수립 및 방향성 제시',
        '팀원들의 의견을 종합하여 최종 결정'
      ],
      tips: [
        '명확하고 구체적인 질문을 제시하세요',
        '팀원들의 다양한 의견을 경청하세요',
        '데이터 기반의 의사결정을 하세요'
      ]
    },
    {
      key: 'researcher',
      name: '리서치',
      icon: Search,
      color: 'text-blue-600 bg-blue-100',
      description: '투자 관련 자료를 수집하고 분석하는 역할',
      responsibilities: [
        '질문에 맞춰 자료·뉴스·지표를 모아 핵심 5줄 정리 (출처 필수)',
        '객관적 데이터 기반 정보 제공',
        '시장 동향 및 관련 뉴스 수집',
        '신뢰할 수 있는 출처의 정보만 활용'
      ],
      tips: [
        '신뢰할 수 있는 출처를 명시하세요',
        '핵심 내용을 간결하게 정리하세요',
        '최신 정보를 우선적으로 수집하세요'
      ]
    },
    {
      key: 'analyzer',
      name: '요약분석',
      icon: BarChart3,
      color: 'text-green-600 bg-green-100',
      description: '토론 결과를 정리하고 결론을 도출하는 역할',
      responsibilities: [
        '토론 후 결론 3줄 (근거 포함) + 다음 액션 (매수/보류/관망)',
        '팀의 의견을 종합하여 명확한 방향 제시',
        '논리적 근거와 함께 결론 도출',
        '구체적인 실행 계획 수립'
      ],
      tips: [
        '논리적 근거를 명확히 제시하세요',
        '구체적인 액션 플랜을 제안하세요',
        '팀원들의 의견을 균형있게 반영하세요'
      ]
    },
    {
      key: 'risk_checker',
      name: '리스크체커',
      icon: Shield,
      color: 'text-red-600 bg-red-100',
      description: '투자 위험을 점검하고 대안을 제시하는 역할',
      responsibilities: [
        '반대 시나리오 2개 + 손절/축소 조건 제안',
        '위험 요소 사전 점검 및 리스크 관리 방안 수립',
        '최악의 상황에 대한 대비책 마련',
        '포트폴리오 리스크 분석'
      ],
      tips: [
        '다양한 리스크 시나리오를 고려하세요',
        '구체적인 손절 기준을 제시하세요',
        '보수적인 관점에서 접근하세요'
      ]
    },
    {
      key: 'recorder',
      name: '기록·입력',
      icon: Edit,
      color: 'text-purple-600 bg-purple-100',
      description: '팀 활동을 기록하고 데이터를 입력하는 역할',
      responsibilities: [
        '참여/역할 체크, 시작/종료/입출금 숫자 입력 (리더보드 자동)',
        '팀 활동 전반의 기록 관리',
        '정확한 데이터 입력 및 관리',
        '주간 보고서 작성 지원'
      ],
      tips: [
        '정확한 숫자를 입력하세요',
        '빠짐없이 모든 활동을 기록하세요',
        '정기적으로 데이터를 업데이트하세요'
      ]
    }
  ];

  const evaluationCriteria = [
    {
      category: '참여 점수',
      score: '5점',
      description: '주간 스터디 참여 여부',
      criteria: '스터디에 참석하면 5점, 불참하면 0점'
    },
    {
      category: '역할 수행 점수',
      score: '10점',
      description: '배정된 역할의 완수 여부',
      criteria: '역할을 완전히 수행하면 10점, 미완수하면 0점'
    },
    {
      category: '활동 점수',
      score: '최대 30점',
      description: '참여 점수 + 역할 수행 점수 (상한 30점)',
      criteria: '참여(5점) + 역할수행(10점) = 최대 15점, 추가 활동으로 최대 30점까지'
    },
    {
      category: '수익률 점수',
      score: '최대 20점',
      description: '팀 투자 수익률에 따른 점수',
      criteria: '-5% = 0점, 0% = 10점, +5% = 20점 (선형 계산)'
    },
    {
      category: '최종 점수',
      score: '최대 50점',
      description: '활동 점수 + 수익률 점수',
      criteria: '활동점수(최대 30점) + 수익률점수(최대 20점) = 최대 50점'
    }
  ];

  const rotationSchedule = [
    { week: '1-2주차', cycle: 1, description: '첫 번째 순환 주기' },
    { week: '3-4주차', cycle: 2, description: '두 번째 순환 주기' },
    { week: '5-6주차', cycle: 3, description: '세 번째 순환 주기' },
    { week: '7-8주차', cycle: 4, description: '네 번째 순환 주기' }
  ];

  const usageSteps = [
    {
      step: 1,
      title: '로그인 및 팀 확인',
      description: '이메일과 비밀번호로 로그인하여 소속 팀을 확인합니다.',
      icon: Users
    },
    {
      step: 2,
      title: '주차 선택',
      description: '평가하고자 하는 주차를 선택합니다.',
      icon: Calendar
    },
    {
      step: 3,
      title: '역할 확인',
      description: '이번 주 본인의 역할과 다음 주 역할을 확인합니다.',
      icon: RotateCw
    },
    {
      step: 4,
      title: '팀 자산 입력',
      description: '기록·입력 담당자가 시작/종료 자산과 순입출금을 입력합니다.',
      icon: TrendingUp
    },
    {
      step: 5,
      title: '멤버 평가',
      description: '각 멤버의 참여 여부와 역할 수행 여부를 체크합니다.',
      icon: CheckCircle
    },
    {
      step: 6,
      title: '역할별 의견 작성',
      description: '각 역할 관점에서 이번 주 활동에 대한 의견을 작성합니다.',
      icon: FileText
    },
    {
      step: 7,
      title: '주간 보고서 확인',
      description: '자동 생성된 주간 보고서를 확인하고 필요시 인쇄합니다.',
      icon: Award
    }
  ];

  const faqData = [
    {
      question: '역할은 어떻게 배정되나요?',
      answer: '역할은 2주마다 자동으로 순환됩니다. 전략리더 → 리서치 → 요약분석 → 리스크체커 순으로 순환하며, 기록·입력 역할은 고정되거나 별도로 지정됩니다.'
    },
    {
      question: '점수는 어떻게 계산되나요?',
      answer: '참여 점수(5점) + 역할 수행 점수(10점) + 수익률 점수(최대 20점) = 최대 50점입니다. 모든 점수는 자동으로 계산됩니다.'
    },
    {
      question: '수익률은 어떻게 계산되나요?',
      answer: '(종료자산 - 시작자산 - 순입출금) ÷ 시작자산 × 100으로 계산됩니다. 예: 1000만원 → 1050만원 (입금 없음) = 5% 수익률'
    },
    {
      question: '역할별 의견은 언제 작성하나요?',
      answer: '주간 스터디 후 각자의 역할 관점에서 의견을 작성합니다. 전략리더는 방향성, 리서치는 자료 분석, 요약분석은 결론, 리스크체커는 위험 요소를 중심으로 작성합니다.'
    },
    {
      question: '포인트 시스템은 어떻게 작동하나요?',
      answer: '관리자가 활성화한 경우에만 포인트 시스템이 작동합니다. 평가 점수에 따라 포인트가 지급되며, 레포트 마켓플레이스에서 사용할 수 있습니다.'
    },
    {
      question: '팀 설정은 누가 변경할 수 있나요?',
      answer: '팀장과 관리자만 팀 설정을 변경할 수 있습니다. 팀 색상, 슬로건, 목표 등을 설정할 수 있습니다.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 헤더 */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 가이드</h1>
          <p className="text-gray-600">새로운 평가시스템 완벽 가이드</p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="roles">역할 가이드</TabsTrigger>
            <TabsTrigger value="evaluation">평가 체계</TabsTrigger>
            <TabsTrigger value="usage">사용법</TabsTrigger>
            <TabsTrigger value="features">기능 설명</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>시스템 개요</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      새로운 평가시스템은 <strong>주간 입력</strong>, <strong>2주 역할 순환</strong>, <strong>자동 점수 계산</strong>을 핵심으로 합니다.
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <h4 className="font-semibold">주간 평가</h4>
                      <p className="text-sm text-gray-600">매주 팀 활동과 개인 역할 수행을 평가</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <RotateCw className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <h4 className="font-semibold">역할 순환</h4>
                      <p className="text-sm text-gray-600">2주마다 자동으로 역할이 순환</p>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <Calculator className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                      <h4 className="font-semibold">자동 계산</h4>
                      <p className="text-sm text-gray-600">점수와 수익률이 자동으로 계산</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      핵심 특징
                    </h4>
                    <ul className="space-y-1 text-sm">
                      <li>• <strong>5가지 역할</strong>: 전략리더, 리서치, 요약분석, 리스크체커, 기록·입력</li>
                      <li>• <strong>자동 점수 계산</strong>: 참여(5점) + 역할수행(10점) + 수익률점수(최대 20점)</li>
                      <li>• <strong>2주 순환 시스템</strong>: 모든 멤버가 다양한 역할을 경험</li>
                      <li>• <strong>실시간 순위</strong>: 팀별 순위와 개인 점수가 실시간 업데이트</li>
                      <li>• <strong>역할별 의견</strong>: 각 역할 관점에서 주간 의견 작성</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>역할 순환 스케줄</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rotationSchedule.map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{schedule.week}</Badge>
                        <span className="font-medium">순환 주기 {schedule.cycle}</span>
                      </div>
                      <span className="text-sm text-gray-600">{schedule.description}</span>
                    </div>
                  ))}
                </div>
                <Alert className="mt-4">
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    기록·입력 역할은 고정되거나 별도로 지정될 수 있습니다.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 역할 가이드 탭 */}
          <TabsContent value="roles" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {roles.map((role) => {
                const RoleIcon = role.icon;
                return (
                  <Card key={role.key} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${role.color}`}>
                          <RoleIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="text-lg">{role.name}</div>
                          <div className="text-sm text-gray-600 font-normal">{role.description}</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-semibold mb-2 flex items-center">
                            <Target className="h-4 w-4 mr-2" />
                            주요 책임
                          </h5>
                          <ul className="space-y-1 text-sm">
                            {role.responsibilities.map((responsibility, index) => (
                              <li key={index} className="flex items-start">
                                <CheckCircle className="h-3 w-3 mt-1 mr-2 text-green-500 flex-shrink-0" />
                                {responsibility}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h5 className="font-semibold mb-2 flex items-center">
                            <Star className="h-4 w-4 mr-2" />
                            성공 팁
                          </h5>
                          <ul className="space-y-1 text-sm">
                            {role.tips.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <Lightbulb className="h-3 w-3 mt-1 mr-2 text-yellow-500 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* 평가 체계 탭 */}
          <TabsContent value="evaluation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>점수 계산 체계</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {evaluationCriteria.map((criteria, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{criteria.category}</h4>
                        <Badge className="bg-blue-100 text-blue-800">{criteria.score}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{criteria.description}</p>
                      <p className="text-xs text-gray-500">{criteria.criteria}</p>
                    </div>
                  ))}
                </div>

                <Alert className="mt-6">
                  <Calculator className="h-4 w-4" />
                  <AlertDescription>
                    <strong>수익률 계산 공식:</strong> (종료자산 - 시작자산 - 순입출금) ÷ 시작자산 × 100
                    <br />
                    <strong>예시:</strong> 1,000만원 → 1,050만원 (입금 없음) = 5% 수익률 = 20점
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>점수 등급 기준</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">0-20점</div>
                    <div className="text-sm text-red-700">개선 필요</div>
                  </div>
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">21-35점</div>
                    <div className="text-sm text-yellow-700">보통</div>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">36-45점</div>
                    <div className="text-sm text-green-700">우수</div>
                  </div>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-600">46-50점</div>
                    <div className="text-sm text-blue-700">최우수</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 사용법 탭 */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5" />
                  <span>단계별 사용법</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {usageSteps.map((step) => {
                    const StepIcon = step.icon;
                    return (
                      <div key={step.step} className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">{step.step}</span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <StepIcon className="h-5 w-5 text-blue-500" />
                            <h4 className="font-semibold">{step.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>주의사항</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>정확한 데이터 입력:</strong> 시작/종료 자산과 순입출금은 정확히 입력해야 수익률이 올바르게 계산됩니다.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>역할 수행 체크:</strong> 각자의 역할을 완전히 수행한 후에만 역할 수행 체크를 해주세요.
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>의견 작성:</strong> 역할별 의견은 해당 역할의 관점에서 구체적이고 건설적으로 작성해주세요.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 기능 설명 탭 */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>주간 평가</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• 팀 자산 입력 및 수익률 자동 계산</li>
                    <li>• 멤버별 참여 및 역할 수행 체크</li>
                    <li>• 실시간 점수 계산 및 표시</li>
                    <li>• 코멘트 작성 기능</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <RotateCw className="h-5 w-5" />
                    <span>역할 현황</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• 이번 주 역할 배정 현황</li>
                    <li>• 다음 주 역할 미리보기</li>
                    <li>• 역할별 상세 설명</li>
                    <li>• 역할 완료 상태 표시</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>역할별 의견</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• 각 역할 관점에서 의견 작성</li>
                    <li>• 역할별 가이드라인 제공</li>
                    <li>• 실시간 저장 기능</li>
                    <li>• 팀 토론 기록 보관</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5" />
                    <span>주간 보고서</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• 자동 생성되는 주간 요약</li>
                    <li>• 팀 성과 및 개인 점수</li>
                    <li>• 역할별 의견 종합</li>
                    <li>• PDF 저장 및 인쇄 기능</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Coins className="h-5 w-5" />
                    <span>포인트 시스템</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• 관리자가 활성화 시 사용 가능</li>
                    <li>• 평가 점수에 따른 포인트 지급</li>
                    <li>• 레포트 마켓플레이스에서 사용</li>
                    <li>• 포인트 거래 내역 관리</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>관리자 기능</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    <li>• 시스템 기능 활성화/비활성화</li>
                    <li>• 팀 생성 및 설정 관리</li>
                    <li>• 사용자 관리 및 포인트 조정</li>
                    <li>• 통계 분석 및 알림 관리</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* FAQ 탭 */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5" />
                  <span>자주 묻는 질문</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {faqData.map((faq, index) => (
                    <div key={index} className="border-b pb-4 last:border-b-0">
                      <h4 className="font-semibold mb-2 flex items-center">
                        <HelpCircle className="h-4 w-4 mr-2 text-blue-500" />
                        {faq.question}
                      </h4>
                      <p className="text-sm text-gray-600 pl-6">{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>추가 도움이 필요하신가요?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-gray-600">
                    더 자세한 도움이 필요하시면 관리자에게 문의해주세요.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      사용자 매뉴얼 다운로드
                    </Button>
                    <Button>
                      <Users className="h-4 w-4 mr-2" />
                      관리자 문의
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}