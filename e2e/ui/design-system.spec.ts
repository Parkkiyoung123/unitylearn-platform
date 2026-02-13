import { test, expect } from "@playwright/test"

test.describe("P3 UI Design System", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/test/ui")
  })

  test("페이지가 정상적으로 로드됨", async ({ page }) => {
    await expect(page).toHaveTitle(/UnityLearn/)
    await expect(page.getByRole("heading", { name: "P3 UI 디자인 시스템 테스트" })).toBeVisible()
  })

  test.describe("Typography", () => {
    test("제목이 올바른 스타일로 표시됨", async ({ page }) => {
      const h1 = page.getByText("안녕하세요 UnityLearn입니다")
      await expect(h1).toBeVisible()
      
      const h2 = page.getByText("버그 진단 학습 플랫폼")
      await expect(h2).toBeVisible()
    })

    test("본문 텍스트가 표시됨", async ({ page }) => {
      await expect(page.getByText(/Unity 입문자부터/)).toBeVisible()
    })
  })

  test.describe("Colors & Badges", () => {
    test("난이도 뱃지가 모두 표시됨", async ({ page }) => {
      // 난이도 섹션에서만 뱃지 찾기
      const colorSection = page.locator("section", { hasText: "색상 시스템" })
      await expect(colorSection.getByText("Beginner").first()).toBeVisible()
      await expect(colorSection.getByText("Easy").first()).toBeVisible()
      await expect(colorSection.getByText("Normal").first()).toBeVisible()
      await expect(colorSection.getByText("Hard").first()).toBeVisible()
      await expect(colorSection.getByText("Expert").first()).toBeVisible()
    })
  })

  test.describe("Buttons", () => {
    test("모든 버튼 variants가 표시됨", async ({ page }) => {
      await expect(page.getByRole("button", { name: "Primary" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Secondary" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Outline" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Ghost" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Danger" })).toBeVisible()
    })

    test("버튼 사이즈 variants가 표시됨", async ({ page }) => {
      await expect(page.getByRole("button", { name: "Small" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Medium" })).toBeVisible()
      await expect(page.getByRole("button", { name: "Large" })).toBeVisible()
    })

    test("Disabled 버튼이 비활성화 상태임", async ({ page }) => {
      const disabledButton = page.getByRole("button", { name: "Disabled" })
      await expect(disabledButton).toBeVisible()
      await expect(disabledButton).toBeDisabled()
    })
  })

  test.describe("Cards", () => {
    test("카드 variants가 표시됨", async ({ page }) => {
      await expect(page.getByText("기본 카드")).toBeVisible()
      await expect(page.getByText("볼더 카드")).toBeVisible()
      await expect(page.getByText("엘리베이티드 카드")).toBeVisible()
    })
  })

  test.describe("Inputs", () => {
    test("입력 필드가 정상 작동함", async ({ page }) => {
      const input = page.getByPlaceholder("텍스트를 입력하세요")
      await expect(input).toBeVisible()
      await input.fill("테스트 입력")
      await expect(input).toHaveValue("테스트 입력")
    })

    test("이메일 입력 필드가 표시됨", async ({ page }) => {
      await expect(page.getByPlaceholder("email@example.com")).toBeVisible()
    })

    test("에러 상태 입력 필드가 표시됨", async ({ page }) => {
      await expect(page.getByText("이 필드는 필수입니다")).toBeVisible()
    })
  })

  test.describe("Quiz Components", () => {
    test("QuizCard가 표시됨", async ({ page }) => {
      await expect(page.getByText("NullReferenceException 디버깅")).toBeVisible()
      await expect(page.getByText("메모리 누수 찾기")).toBeVisible()
    })

    test("ProgressBar가 표시됨", async ({ page }) => {
      await expect(page.getByText("3 / 10")).toBeVisible()
      await expect(page.getByText("7 / 10")).toBeVisible()
      await expect(page.getByText("9 / 10")).toBeVisible()
    })
  })

  test.describe("Responsive Layout", () => {
    test("모바일 뷰에서 정상 표시됨", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.reload()
      await expect(page.getByRole("heading", { name: "P3 UI 디자인 시스템 테스트" })).toBeVisible()
    })

    test("태블릿 뷰에서 정상 표시됨", async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })
      await page.reload()
      await expect(page.getByRole("heading", { name: "P3 UI 디자인 시스템 테스트" })).toBeVisible()
    })

    test("데스크톱 뷰에서 정상 표시됨", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 })
      await page.reload()
      await expect(page.getByRole("heading", { name: "P3 UI 디자인 시스템 테스트" })).toBeVisible()
    })
  })

  test.describe("Touch Target", () => {
    test("버튼이 44px 이상의 터치 타겟을 가짐", async ({ page }) => {
      const button = page.getByRole("button", { name: "Primary" })
      const box = await button.boundingBox()
      expect(box?.height).toBeGreaterThanOrEqual(44)
      expect(box?.width).toBeGreaterThanOrEqual(44)
    })
  })
})
