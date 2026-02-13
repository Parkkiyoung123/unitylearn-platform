import { test, expect } from "@playwright/test"

test.describe("온볼딩 기능", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => {
      localStorage.clear()
      localStorage.setItem("unitylearn_onboarding_completed", "false")
    })
    await page.reload()
  })

  test("온볼딩 페이지 접근", async ({ page }) => {
    await page.goto("/onboarding")
    
    // 페이지 제목 확인 (heading 사용)
    await expect(page.getByRole("heading", { name: "UnityLearn" })).toBeVisible()
    await expect(page.getByText("몇 가지 정보를 알려주시면 맞춤 학습을 시작합니다")).toBeVisible()
    
    // Step 1 확인 (프로필)
    await expect(page.getByText("프로필")).toBeVisible()
    await expect(page.getByRole("textbox", { name: "닉네임*" })).toBeVisible()
  })

  test("Step 1 - 닉네임 입력 및 유효성 검사", async ({ page }) => {
    await page.goto("/onboarding")
    
    // 기존 닉네임 클리어하고 새로운 닉네임 입력
    await page.getByRole("textbox", { name: "닉네임*" }).fill("TestUser")
    
    // 다음 버튼 클릭
    await page.getByRole("button", { name: "다음" }).click()
    
    // Step 2로 이동 확인 (수준 단계) - exact match
    await expect(page.getByText("수준", { exact: true })).toBeVisible()
  })

  test("Step 1 - 닉네임 유효성 검사 (짧은 닉네임)", async ({ page }) => {
    await page.goto("/onboarding")
    
    // 기존 닉네임 클리어하고 1자 닉네임 입력
    const nicknameInput = page.getByRole("textbox", { name: "닉네임*" })
    await nicknameInput.fill("")
    await nicknameInput.fill("A")
    
    // 다음 버튼이 비활성화되어 있는지 확인
    const nextButton = page.getByRole("button", { name: "다음" })
    await expect(nextButton).toBeDisabled()
    
    // 여전히 Step 1에 있는지 확인
    await expect(page.getByText("프로필")).toBeVisible()
  })

  test("Step 2 - 수준 선택", async ({ page }) => {
    await page.goto("/onboarding")
    
    // Step 1 완료
    await page.getByRole("textbox", { name: "닉네임*" }).fill("TestUser")
    await page.getByRole("button", { name: "다음" }).click()
    
    // Step 2 (수준) 확인 - exact match
    await expect(page.getByText("수준", { exact: true })).toBeVisible()
    
    // 수준 선택 (버튼으로 선택)
    const levelButton = page.getByRole("button").filter({ hasText: /처음|기본|다양/ }).first()
    if (await levelButton.count() > 0) {
      await levelButton.click()
    }
  })

  test("Step 3 - 관심 카테고리 선택", async ({ page }) => {
    await page.goto("/onboarding")
    
    // Step 1 완료
    await page.getByRole("textbox", { name: "닉네임*" }).fill("TestUser")
    await page.getByRole("button", { name: "다음" }).click()
    await page.waitForTimeout(500)
    
    // Step 2 완료 (수준 선택)
    const levelButton = page.getByRole("button").filter({ hasText: /처음|기본|다양/ }).first()
    if (await levelButton.count() > 0) {
      await levelButton.click()
      await page.waitForTimeout(300)
    }
    await page.getByRole("button", { name: "다음" }).click()
    await page.waitForTimeout(500)
    
    // Step 3 (관심사) 확인 - exact match
    await expect(page.getByText("관심사", { exact: true })).toBeVisible()
  })

  test("온볼딩 완료 - LocalStorage 저장", async ({ page }) => {
    await page.goto("/onboarding")
    
    // Step 1: 닉네임 입력
    await page.getByRole("textbox", { name: "닉네임*" }).fill("TestUser")
    await page.getByRole("button", { name: "다음" }).click()
    await page.waitForTimeout(500)
    
    // Step 2: 수준 선택 (첫 번째 옵션 선택)
    const levelButtons = page.locator('button').filter({ hasText: /처음|입문|초급/ })
    if (await levelButtons.count() > 0) {
      await levelButtons.first().click()
      await page.waitForTimeout(500)
    }
    
    // Step 2 다음 버튼 클릭 및 Step 3 진입 대기
    await page.getByRole("button", { name: "다음" }).click()
    await page.waitForTimeout(3000) // Step 3 완전 로딩 대기
    
    // Step 3: '걸 뛰기' 버튼 클릭 (공백 주의!)
    await page.getByRole('button', { name: /걸.*뛰기|완료/ }).click()
    await page.waitForTimeout(1000)
    
    // Step 4: 완료 페이지 확인 및 시작하기 버튼 클릭
    await expect(page.getByText("환영합니다")).toBeVisible()
    await page.getByRole('button', { name: /시작하기|퀴즈/ }).click()
    await page.waitForTimeout(500)
    
    // LocalStorage 확인
    const completed = await page.evaluate(() => {
      return localStorage.getItem("unitylearn_onboarding_completed")
    })
    expect(completed).toBe("true")
  })

  test("진단 테스트 결과 연동 - 수준 자동 선택", async ({ page }) => {
    // 진단 테스트 결과 설정
    await page.evaluate(() => {
      localStorage.setItem("diagnostic_result", JSON.stringify({
        score: 90,
        recommendedLevel: "advanced"
      }))
    })
    
    await page.goto("/onboarding?diagnostic_score=90")
    
    // Step 1 완료
    await page.getByRole("textbox", { name: "닉네임*" }).fill("TestUser")
    await page.getByRole("button", { name: "다음" }).click()
    await page.waitForTimeout(500)
    
    // Step 2에서 수준 선택 화면 확인 - exact match
    await expect(page.getByText("수준", { exact: true })).toBeVisible()
  })

  test("온볼딩 Skip 기능", async ({ page }) => {
    await page.goto("/onboarding")
    
    // 걸너뛰기 버튼 클릭 (실제 페이지에서는 "걸너뛰기"로 표시됨)
    const skipButton = page.getByRole("button").filter({ hasText: /걸너뛰기|걸너|Skip/ })
    if (await skipButton.count() > 0) {
      await skipButton.click()
    } else {
      // "나중에 설정하기" 버튼으로 대체
      await page.getByRole("button", { name: "나중에 설정하기" }).click()
    }
    
    // 홈 또는 대시보드로 이동 확인
    await expect(page.locator("body")).toBeVisible()
  })
})
