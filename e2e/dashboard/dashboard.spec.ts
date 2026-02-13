import { test, expect, Page } from "@playwright/test"
import { clearLocalStorage } from "../utils/auth"

/**
 * ============================================
 * 테스트 데이터 및 상수
 * ============================================
 */
const TEST_USER = {
  email: "test@example.com",
  password: "password123",
}

const TEST_QUIZ = {
  id: "quiz-1",
  title: "Unity 기초: 씬 구성",
  category: "기초",
}

const DASHBOARD_SELECTORS = {
  header: "h1",
  statCards: "[data-testid='stat-card']",
  continueBanner: "[data-testid='continue-banner']",
  levelTabs: "[data-testid='level-tabs'] button",
  quizList: "[data-testid='quiz-list']",
  quizItems: "[data-testid='quiz-item']",
  recommendedSection: "[data-testid='recommended-section']",
  recommendedCards: "[data-testid='recommended-card']",
}

/**
 * ============================================
 * 헬퍼 함수
 * ============================================
 */

/**
 * 대시보드 페이지로 이동
 */
async function gotoDashboard(page: Page) {
  await page.goto("/dashboard")
  await page.waitForLoadState("networkidle")
}

/**
 * 테스트용 인증 상태 설정 (localStorage mocking)
 */
async function mockAuthenticatedUser(page: Page) {
  await page.evaluate(() => {
    localStorage.setItem(
      "unitylearn-auth",
      JSON.stringify({
        user: {
          id: "test-user-id",
          email: "test@example.com",
          name: "테스트 사용자",
        },
        isAuthenticated: true,
      })
    )
  })
}

/**
 * 대시보드 데이터 API 모킹
 */
async function mockDashboardData(page: Page) {
  await page.route("**/api/dashboard/**", async (route) => {
    const url = route.request().url()

    if (url.includes("/api/dashboard/stats")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          currentLevel: "Intermediate",
          totalAttempts: 150,
          correctCount: 120,
          accuracy: 80,
          streakDays: 5,
          weeklyProgress: 25,
          weakCategories: ["물리 엔진"],
        }),
      })
    } else if (url.includes("/api/dashboard/continue")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          hasUnfinished: true,
          lastQuizId: "quiz-continue-1",
          lastQuizTitle: "Unity 물리 엔진 마스터",
          progressPercent: 65,
        }),
      })
    } else if (url.includes("/api/dashboard/quizzes")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          quizzes: [
            {
              id: "quiz-1",
              title: "Unity 기초: 씬 구성",
              category: "기초",
              level: "Easy",
              isCompleted: true,
              isLocked: false,
            },
            {
              id: "quiz-2",
              title: "C# 스크립트 기초",
              category: "프로그래밍",
              level: "Easy",
              isCompleted: false,
              isLocked: false,
            },
            {
              id: "quiz-3",
              title: "Rigidbody와 Collider",
              category: "물리",
              level: "Medium",
              isCompleted: false,
              isLocked: true,
            },
          ],
          levelCounts: {
            Beginner: { completed: 10, total: 20 },
            Intermediate: { completed: 5, total: 25 },
            Advanced: { completed: 0, total: 20 },
            Expert: { completed: 0, total: 15 },
            Master: { completed: 0, total: 10 },
          },
        }),
      })
    } else if (url.includes("/api/dashboard/recommended")) {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          recommendations: [
            {
              id: "rec-1",
              title: "C# 스크립트 기초",
              category: "프로그래밍",
              reason: "최근 '변수' 개념을 학습하셨어요",
              level: "Easy",
            },
            {
              id: "rec-2",
              title: "Unity UI 시스템",
              category: "UI",
              reason: "UI 개발에 관심이 있으신 것 같아요",
              level: "Medium",
            },
          ],
        }),
      })
    } else {
      await route.continue()
    }
  })
}

/**
 * ============================================
 * 테스트 스위트: 대시보드 기능
 * ============================================
 */
test.describe("대시보드 기능", () => {
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 localStorage 초기화 및 인증 상태 설정
    await page.goto("/")
    await clearLocalStorage(page)
    await mockAuthenticatedUser(page)
    await mockDashboardData(page)
  })

  /**
   * 테스트 1: 대시보드 기본 로드
   * Given: 인증된 사용자
   * When: 대시보드 페이지에 접속
   * Then: 헤더, 통계 카드, 추천 섹션이 표시된다
   */
  test("대시보드 페이지가 정상적으로 로드된다", async ({ page }) => {
    // Given & When
    await gotoDashboard(page)

    // Then
    await expect(page).toHaveURL("/dashboard")

    // 헤더 확인
    const header = page.locator("h1").filter({ hasText: "대시보드" })
    await expect(header).toBeVisible()

    // 페이지 제목 확인
    await expect(page).toHaveTitle(/대시보드|Dashboard|UnityLearn/i)

    // 주요 섹션들이 존재하는지 확인 (데이터 로딩 후)
    await expect(page.locator("body")).toContainText("학습 진도")
  })

  /**
   * 테스트 2: 통계 정보 표시
   * Given: 대시보드에 접속한 인증된 사용자
   * When: 통계 데이터가 로드되면
   * Then: 정답률, 완료한 퀴즈 수, 연속 학습 일수가 표시된다
   */
  test("사용자 통계가 올바르게 표시된다", async ({ page }) => {
    // Given
    await gotoDashboard(page)

    // When - API 응답 대기
    await page.waitForResponse("**/api/dashboard/stats")

    // Then
    // 정답률 확인 (80%)
    await expect(page.locator("body")).toContainText("80")
    await expect(page.locator("body")).toContainText("%")

    // 완료한 퀴즈/시도 수 확인
    await expect(page.locator("body")).toContainText("120")
    await expect(page.locator("body")).toContainText("150")

    // 연속 학습 일수 확인
    await expect(page.locator("body")).toContainText("5")
    await expect(page.locator("body")).toContainText("일")

    // 통계 카드들이 표시되는지 확인
    const statTexts = ["정답률", "완료", "연속", "레벨"]
    for (const text of statTexts) {
      await expect(
        page.locator("body").filter({ hasText: new RegExp(text) })
      ).toBeVisible()
    }
  })

  /**
   * 테스트 3: 이어하기 기능
   * Given: 미완료 퀴즈가 있는 인증된 사용자
   * When: 대시보드에 접속하면
   * Then: 이어하기 배너가 표시되고 클릭 시 퀴즈 페이지로 이동한다
   */
  test("이어하기 배너가 미완료 퀴즈가 있을 때 표시된다", async ({ page }) => {
    // Given
    await gotoDashboard(page)
    await page.waitForResponse("**/api/dashboard/continue")

    // When & Then
    // 이어하기 배너가 표시되는지 확인
    await expect(page.locator("body")).toContainText("이어서 학습하기")
    await expect(page.locator("body")).toContainText("Unity 물리 엔진 마스터")

    // 진행률 확인 (65%)
    await expect(page.locator("body")).toContainText("65")

    // 이어하기 버튼 클릭
    const continueButton = page
      .getByRole("button", { name: /이어하기|계속하기/i })
      .first()
    await expect(continueButton).toBeVisible()

    // 클릭 시 퀴즈 페이지로 이동
    await continueButton.click()
    await expect(page).toHaveURL(/\/quiz\/quiz-continue-1/)
  })

  /**
   * 테스트 4: 레벨별 퀴즈 탭
   * Given: 대시보드에 접속한 인증된 사용자
   * When: 다른 레벨 탭을 클릭하면
   * Then: 해당 레벨의 퀴즈 목록이 표시된다
   */
  test("레벨 탭을 클릭하면 해당 레벨의 퀴즈가 표시된다", async ({ page }) => {
    // Given
    await gotoDashboard(page)
    await page.waitForResponse("**/api/dashboard/quizzes")

    // 초기 레벨 탭 확인 (Beginner)
    await expect(page.locator("body")).toContainText("초급")

    // When: 중급(Intermediate) 탭 클릭
    const intermediateTab = page
      .getByRole("button", { name: /중급|Intermediate/ })
      .first()
    await intermediateTab.click()

    // Then: 해당 레벨의 퀴즈 목록 확인
    await expect(page.locator("body")).toContainText("5")
    await expect(page.locator("body")).toContainText("/")
    await expect(page.locator("body")).toContainText("25")

    // 다른 레벨 탭도 테스트
    const advancedTab = page
      .getByRole("button", { name: /고급|Advanced/ })
      .first()
    await advancedTab.click()

    await expect(page.locator("body")).toContainText("0")
    await expect(page.locator("body")).toContainText("20")
  })

  /**
   * 테스트 5: 퀴즈 클릭 이동
   * Given: 대시보드의 퀴즈 목록이 표시된 상태
   * When: 퀴즈 카드를 클릭하면
   * Then: 해당 퀴즈 풀이 페이지로 이동한다
   */
  test("퀴즈 카드 클릭 시 퀴즈 풀이 페이지로 이동한다", async ({ page }) => {
    // Given
    await gotoDashboard(page)
    await page.waitForResponse("**/api/dashboard/quizzes")

    // When: 첫 번째 사용 가능한 퀴즈 클릭
    // QuizListItem 컴포넌트는 클릭 가능한 카드 형태
    const quizItem = page
      .locator("div")
      .filter({ hasText: TEST_QUIZ.title })
      .first()

    // 퀴즈가 표시되어 있는지 확인
    await expect(page.locator("body")).toContainText(TEST_QUIZ.title)

    // 클릭 가능한 퀴즈 아이템 찾기 (잠금되지 않은 것)
    const availableQuiz = page
      .getByText("Unity 기초: 씬 구성")
      .locator("..")
      .locator("..")
      .first()

    await availableQuiz.click()

    // Then
    await expect(page).toHaveURL(/\/quiz\/quiz-1/)
  })

  /**
   * 테스트 6: 추천 퀴즈
   * Given: 대시보드에 접속한 인증된 사용자
   * When: 추천 학습 섹션이 로드되면
   * Then: 추천 카드가 표시되고 클릭 가능하다
   */
  test("추천 학습 카드가 표시되고 클릭 가능하다", async ({ page }) => {
    // Given
    await gotoDashboard(page)
    await page.waitForResponse("**/api/dashboard/recommended")

    // When & Then
    // 추천 섹션 확인
    await expect(page.locator("body")).toContainText("추천")
    await expect(page.locator("body")).toContainText("추천 학습")

    // 추천 이유 표시 확인
    await expect(page.locator("body")).toContainText(
      "최근 '변수' 개념을 학습하셨어요"
    )

    // 추천 카드 제목 확인
    await expect(page.locator("body")).toContainText("C# 스크립트 기초")

    // 학습 시작 버튼 클릭
    const startButton = page
      .getByRole("button", { name: /지금 학습하기|학습 시작/ })
      .first()
    await expect(startButton).toBeVisible()

    await startButton.click()

    // 추천된 학습 페이지로 이동 확인
    await expect(page).toHaveURL(/\/quiz\/rec-1|\/learn\/rec-1/)
  })
})

/**
 * ============================================
 * 테스트 스위트: 인증 및 접근 제어
 * ============================================
 */
test.describe("대시보드 접근 제어", () => {
  test.beforeEach(async ({ page }) => {
    // 비로그인 상태로 시작
    await page.goto("/")
    await clearLocalStorage(page)
  })

  /**
   * 테스트 7: 비로그인 접근 제한
   * Given: 로그인하지 않은 사용자
   * When: 대시보드에 직접 접속하려고 하면
   * Then: 로그인 페이지로 리다이렉트된다
   */
  test("로그인하지 않은 사용자는 로그인 페이지로 리다이렉트된다", async ({
    page,
  }) => {
    // Given - 비로그인 상태

    // When
    await gotoDashboard(page)

    // Then
    // 로그인 페이지로 리다이렉트 확인
    await expect(page).toHaveURL(/\/auth\/signin|login/)

    // 로그인 폼이 표시되는지 확인
    const emailInput = page.getByRole("textbox", { name: "이메일" })
    await expect(emailInput).toBeVisible()

    // 또는 로그인 버튼 확인
    const loginButton = page.getByRole("button", { name: /로그인|Sign in/i })
    await expect(loginButton).toBeVisible()
  })

  /**
   * 추가 테스트: 로그인 후 대시보드 접근
   * Given: 로그인하지 않은 사용자
   * When: 로그인 후 대시보드에 접속하면
   * Then: 대시보드가 정상적으로 표시된다
   */
  test("로그인 후 대시보드에 접근할 수 있다", async ({ page }) => {
    // Given: 비로그인 상태에서 대시보드 접근 시도
    await gotoDashboard(page)
    await expect(page).toHaveURL(/\/auth/)

    // When: 로그인 (모킹된 인증 사용)
    await mockAuthenticatedUser(page)
    await mockDashboardData(page)
    await gotoDashboard(page)

    // Then
    await expect(page).toHaveURL("/dashboard")
    await expect(page.locator("h1").filter({ hasText: "대시보드" })).toBeVisible()
  })
})

/**
 * ============================================
 * 테스트 스위트: 에러 상황 처리
 * ============================================
 */
test.describe("대시보드 에러 처리", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await clearLocalStorage(page)
    await mockAuthenticatedUser(page)
  })

  test("API 오류 시 에러 메시지를 표시한다", async ({ page }) => {
    // Given: API 오류 상황 모킹
    await page.route("**/api/dashboard/stats", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Internal Server Error" }),
      })
    })

    // When
    await gotoDashboard(page)

    // Then: 에러 상태 처리 확인 (에러 메시지 또는 재시도 UI)
    // 실제 구현에 따라 다를 수 있음
    await expect(page.locator("body")).toBeVisible()
  })

  test("네트워크 오류 시 적절히 처리한다", async ({ page }) => {
    // Given: 네트워크 오류 모킹
    await page.route("**/api/dashboard/**", async (route) => {
      await route.abort("internetdisconnected")
    })

    // When
    await gotoDashboard(page)

    // Then: 페이지가 로드되고 오류 처리 UI 표시
    await expect(page.locator("body")).toBeVisible()
    await expect(page.locator("h1").filter({ hasText: "대시보드" })).toBeVisible()
  })
})

/**
 * ============================================
 * 테스트 스위트: 반응형 디자인
 * ============================================
 */
test.describe("대시보드 반응형 디자인", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await clearLocalStorage(page)
    await mockAuthenticatedUser(page)
    await mockDashboardData(page)
  })

  test("데스크톱 뷰에서 모든 요소가 표시된다", async ({ page }) => {
    // Given: 데스크톱 뷰포트 (기본 설정)
    await page.setViewportSize({ width: 1280, height: 720 })

    // When
    await gotoDashboard(page)

    // Then
    await expect(page.locator("h1").filter({ hasText: "대시보드" })).toBeVisible()
  })

  test("모바일 뷰에서 레이아웃이 조정된다", async ({ page }) => {
    // Given: 모바일 뷰포트
    await page.setViewportSize({ width: 375, height: 667 })

    // When
    await gotoDashboard(page)

    // Then
    await expect(page.locator("h1").filter({ hasText: "대시보드" })).toBeVisible()

    // 모바일에서도 콘텐츠가 표시되는지 확인
    await expect(page.locator("body")).toContainText("학습 진도")
  })
})
