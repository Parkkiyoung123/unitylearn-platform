import { test, expect } from "@playwright/test"

test.describe("랜딩 페이지", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("Hero 섹션 표시", async ({ page }) => {
    // 제목 확인 (h1 heading 사용)
    await expect(page.getByRole("heading", { name: "Unity 버그 진단 마스터되기" })).toBeVisible()
    
    // 부제목 확인 (배지 텍스트)
    await expect(page.getByText("실제 버그 사례 기반 학습 플랫폼")).toBeVisible()
  })

  test("CTA 버튼 표시", async ({ page }) => {
    // 진단 테스트 시작하기 버튼
    await expect(page.getByRole("button", { name: "진단 테스트 시작하기" })).toBeVisible()
    
    // 게스트 버튼
    await expect(page.getByRole("button", { name: "게스트로 체험하기" })).toBeVisible()
  })

  test("미리보기 문제 섹션", async ({ page }) => {
    // 미리보기 텍스트 확인 (첫 번째 것만)
    await expect(page.getByText("미리보기").first()).toBeVisible()
    
    // Rigidbody 문제 제목 확인
    await expect(page.getByRole("heading", { name: "Rigidbody가 충돌 후 움직이지 않음" })).toBeVisible()
  })

  test("기능 하이라이트 섹션", async ({ page }) => {
    // 3가지 핵심 기능 heading 확인
    await expect(page.getByRole("heading", { name: "실제 버그 사례 기반 학습" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "AI 진단으로 맞춤 난이도 추천" })).toBeVisible()
    await expect(page.getByRole("heading", { name: "게스트 모드로 가입 없이 체험" })).toBeVisible()
  })

  test("게스트로 체험하기 버튼 클릭", async ({ page }) => {
    await page.getByRole("button", { name: "게스트로 체험하기" }).click()
    
    // 퀴즈 페이지로 이동
    await expect(page).toHaveURL(/\/quiz/)
  })

  test("진단 테스트 버튼 클릭", async ({ page }) => {
    // "진단 테스트" 네비게이션 링크 클릭 (exact match)
    await page.getByRole("link", { name: "진단 테스트", exact: true }).click()
    
    // 진단 테스트 페이지로 이동
    await expect(page).toHaveURL(/\/diagnostic/)
  })
})
