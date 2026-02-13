"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { QuizCard } from "@/components/quiz/QuizCard"
import { LevelBadge } from "@/components/quiz/LevelBadge"
import { ProgressBar } from "@/components/quiz/ProgressBar"
import { Container } from "@/components/layout/Container"
import { Grid } from "@/components/layout/Grid"

export default function UITestPage() {
  return (
    <Container className="py-12">
      <div className="space-y-16">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">P3 UI 디자인 시스템 테스트</h1>
          <p className="text-muted-foreground">Typography, Colors, Components, Layout</p>
          <Button variant="outline" size="sm">다크모드 토글 (데모)</Button>
        </div>

        {/* Typography Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">타이포그래피 (Typography)</h2>
          <div className="space-y-4">
            <div>
              <span className="text-sm text-muted-foreground">Heading 1 (32px)</span>
              <h1 className="text-heading-1">안녕하세요 UnityLearn입니다</h1>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Heading 2 (24px)</span>
              <h2 className="text-heading-2">버그 진단 학습 플랫폼</h2>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Heading 3 (20px)</span>
              <h3 className="text-heading-3">실제 버그 사례로 배우기</h3>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Body Large (18px)</span>
              <p className="text-body-lg text-muted-foreground">
                Unity 입문자부터 고급 개발자까지 실제 버그 사례를 통해 문제 해결력을 기르는 학습 플랫폼입니다.
              </p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Body Medium (16px)</span>
              <p className="text-body-base">
                게이미피케이션 요소를 통해 재미있게 학습하고, AI 진단 테스트로 자신의 레벨을 확인하세요.
              </p>
            </div>
          </div>
        </section>

        {/* Colors Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">색상 시스템 (Colors)</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-3">난이도별 색상</h3>
              <div className="flex flex-wrap gap-3">
                <LevelBadge level={1} />
                <LevelBadge level={2} />
                <LevelBadge level={3} />
                <LevelBadge level={4} />
                <LevelBadge level={5} />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Primary 색상</h3>
              <div className="flex gap-2">
                <div className="w-16 h-16 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-xs">Primary</div>
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center text-secondary-foreground text-xs">Secondary</div>
                <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs">Muted</div>
                <div className="w-16 h-16 rounded-lg bg-accent flex items-center justify-center text-accent-foreground text-xs">Accent</div>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">버튼 (Buttons)</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-3">Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">Sizes</h3>
              <div className="flex flex-wrap gap-3 items-center">
                <Button size="sm">Small</Button>
                <Button size="md">Medium</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-3">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button>Default</Button>
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Cards Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">카드 (Cards)</h2>
          <Grid cols={1} md={2} lg={3}>
            <Card>
              <CardHeader>
                <CardTitle>기본 카드</CardTitle>
                <CardDescription>기본 스타일의 카드입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">카드 내용이 들어갑니다.</p>
              </CardContent>
              <CardFooter>
                <Button size="sm">Action</Button>
              </CardFooter>
            </Card>
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>볼더 카드</CardTitle>
                <CardDescription>테두리가 있는 카드입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">볼더 스타일을 적용했습니다.</p>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>엘리베이티드 카드</CardTitle>
                <CardDescription>그림자가 있는 카드입니다</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">그림자 효과를 적용했습니다.</p>
              </CardContent>
            </Card>
          </Grid>
        </section>

        {/* Inputs Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">입력 필드 (Inputs)</h2>
          <div className="max-w-md space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">기본 입력</label>
              <Input placeholder="텍스트를 입력하세요" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">이메일</label>
              <Input type="email" placeholder="email@example.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">비밀번호</label>
              <Input type="password" placeholder="비밀번호 입력" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">에러 상태</label>
              <Input placeholder="에러 예시" error="이 필드는 필수입니다" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">비활성화</label>
              <Input placeholder="비활성화됨" disabled />
            </div>
          </div>
        </section>

        {/* Quiz Components Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">퀴즈 컴포넌트 (Quiz Components)</h2>
          
          <div>
            <h3 className="text-lg font-medium mb-3">Quiz Cards</h3>
            <Grid cols={1} md={2}>
              <QuizCard
                id="1"
                title="NullReferenceException 디버깅"
                description="가장 흔한 Unity 에러인 NullReferenceException의 원인과 해결 방법을 학습합니다."
                difficulty={1}
                category="Debugging"
                isCompleted={false}
                onClick={() => console.log("Quiz 1 clicked")}
              />
              <QuizCard
                id="2"
                title="메모리 누수 찾기"
                description="Profiler를 사용하여 메모리 누수를 감지하고 해결하는 방법을 배웁니다."
                difficulty={3}
                category="Performance"
                isCompleted={true}
                onClick={() => console.log("Quiz 2 clicked")}
              />
              <QuizCard
                id="3"
                title="쉐이더 최적화"
                description="복잡한 쉐이더를 최적화하여 프레임 레이트를 개선하는 고급 기법을 학습합니다."
                difficulty={5}
                category="Graphics"
                isCompleted={false}
                onClick={() => console.log("Quiz 3 clicked")}
              />
            </Grid>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Progress Bars</h3>
            <div className="max-w-md space-y-4">
              <div>
                <span className="text-sm text-muted-foreground mb-2 block">Small</span>
                <ProgressBar current={3} total={10} size="sm" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground mb-2 block">Medium (기본)</span>
                <ProgressBar current={7} total={10} />
              </div>
              <div>
                <span className="text-sm text-muted-foreground mb-2 block">Large</span>
                <ProgressBar current={9} total={10} size="lg" />
              </div>
              <div>
                <span className="text-sm text-muted-foreground mb-2 block">라벨 없음</span>
                <ProgressBar current={5} total={10} showLabel={false} />
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Layout Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">반응형 레이아웃 (Responsive Layout)</h2>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              이 페이지는 Container와 Grid 컴포넌트를 사용하여 반응형으로 구현되었습니다.
              브라우저 크기를 조절하여 확인필요: 모바일(1열) → 태블릿(2열) → 데스크톱(3열)
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="h-20 bg-primary/20 rounded-lg flex items-center justify-center text-sm">Column 1</div>
              <div className="h-20 bg-primary/20 rounded-lg flex items-center justify-center text-sm">Column 2</div>
              <div className="h-20 bg-primary/20 rounded-lg flex items-center justify-center text-sm">Column 3</div>
              <div className="h-20 bg-primary/20 rounded-lg flex items-center justify-center text-sm">Column 4</div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-muted-foreground pt-8 border-t">
          <p>P3 UI 디자인 시스템 테스트 완료</p>
          <p className="text-sm mt-1">모든 컴포넌트가 44px 이상의 터치 타겟을 보장합니다</p>
        </footer>
      </div>
    </Container>
  )
}
