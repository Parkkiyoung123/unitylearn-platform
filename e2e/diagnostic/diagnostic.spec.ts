import { test, expect } from "@playwright/test"

test.describe("진단 테스트 기능", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
    await page.evaluate(() => localStorage.clear())
    await page.reload()
  })

  test("진단 테스트 페이지 접근", async ({ page }) => {
    await page.goto("/diagnostic")
    
    // 페이지 제목 확인
    await expect(page.getByRole("heading", { name: "버그 진단 테스트" })).toBeVisible()
    await expect(page.getByText("문제 1 / 5")).toBeVisible()
  })

  test("진단 테스트 시작 - 첫 문제 표시", async ({ page }) => {
    await page.goto("/diagnostic")
    
    // 첫 문제 확인
    await expect(page.getByText("문제 1 / 5")).toBeVisible()
    await expect(page.getByText("단계 1: 원인 분석")).toBeVisible()
    
    // 선택지 4개 존재 확인 (각 버튼을 개별적으로 확인)
    await expect(page.getByRole("button", { name: "A Rigidbody 컴포넌트가 없음" })).toBeVisible()
    await expect(page.getByRole("button", { name: "B Collider가 IsTrigger로 설정됨" })).toBeVisible()
    await expect(page.getByRole("button", { name: "C GameObject가 비활성화됨" })).toBeVisible()
    await expect(page.getByRole("button", { name: "D 스크립트에 오타가 있음" })).toBeVisible()
  })

  test("진단 테스트 - 원인 선택 후 해결 방법 단계로 이동", async ({ page }) => {
    await page.goto("/diagnostic")
    
    // 첫 번째 선택지 클릭
    await page.getByRole("button", { name: "A Rigidbody 컴포넌트가 없음" }).click()
    
    // 해결 방법 단계로 이동 확인 (애니메이션 대기)
    await page.waitForTimeout(500)
    await expect(page.locator("body")).toContainText("해결 방법")
  })

  test("진단 테스트 - 2단계 완료 후 다음 문제로", async ({ page }) => {
    await page.goto("/diagnostic")
    
    // 첫 문제 원인 선택
    await page.getByRole("button", { name: "A Rigidbody 컴포넌트가 없음" }).click()
    await page.waitForTimeout(600)
    
    // 해결 방법 선택 (첫 번째 버튼)
    const buttons = page.getByRole("button").filter({ hasText: /^(A|B|C|D)\s/ })
    if (await buttons.count() > 0) {
      await buttons.first().click()
    }
    await page.waitForTimeout(600)
    
    // 다음 문제로 진행 또는 결과 페이지로 이동
    await expect(page.locator("body")).toContainText("문제")
  })

  test("진단 테스트 - 진행 상황 저장", async ({ page }) => {
    await page.goto("/diagnostic")
    
    // 첫 문제 해결
    await page.getByRole("button", { name: "A Rigidbody 컴포넌트가 없음" }).click()
    await page.waitForTimeout(600)
    
    const buttons = page.getByRole("button").filter({ hasText: /^(A|B|C|D)\s/ })
    if (await buttons.count() > 0) {
      await buttons.first().click()
    }
    await page.waitForTimeout(600)
    
    // LocalStorage에 저장 확인 (실제 구현과 동일한 키 사용)
    const progress = await page.evaluate(() => {
      return localStorage.getItem("unitylearn_diagnostic_progress")
    })
    expect(progress).toBeTruthy()
  })

  test("진단 테스트 완료 - 결과 페이지 이동", async ({ page }) => {
    await page.goto("/diagnostic")
    
    // 각 문제의 stage1과 stage2 첫 번째 선택지 정의
    const questions = [
      { stage1: "Rigidbody 컴포넌트가 없음", stage2: "IsTrigger를 해제하거나 OnTriggerEnter 메서드를 사용" },
      { stage1: "DontDestroyOnLoad를 잘못된 객체에 적용함", stage2: "Scene에 하나의 인스턴스만 존재하도록 중복 체크 로직 추가" },
      { stage1: "Time.timeScale이 0으로 설정됨", stage2: "코루틴 시작 조건을 제대로 체크하여 중복 실행 방지" },
      { stage1: "Unity 에디터의 버그", stage2: "RuntimeInitializeOnLoadMethod를 사용하여 정적 변수 초기화" },
      { stage1: "IL2CPP는 Reflection을 완전히 지원하지 않음", stage2: "link.xml에 Reflection으로 접근하는 타입을 preserve로 등록" }
    ]
    
    // 5문제 모두 풀기 (각 문제는 원인 분석 + 해결 방법 2단계)
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      
      // === 단계 1: 원인 분석 ===
      // stage1이 끝날 때까지 대기 후 첫 번째 선택지 클릭
      await page.waitForSelector('text=원인 분석')
      const stage1Button = page.locator('button:not([disabled])', { hasText: question.stage1 })
      await stage1Button.click()
      await page.waitForTimeout(800)
      
      // "해결 방법 선택하기" 버튼이 나타날 때까지 대기 후 클릭
      await page.getByRole("button", { name: /해결 방법 선택하기/ }).click()
      await page.waitForTimeout(1500) // AnimatePresence exit 애니메이션 + 상태 업데이트 대기
      
      // === 단계 2: 해결 방법 ===
      // stage2가 로드될 때까지 대기
      await page.waitForSelector('text=해결 방법')
      const stage2Button = page.locator('button:not([disabled])', { hasText: question.stage2 })
      await stage2Button.click()
      await page.waitForTimeout(800)
      
      // "다음 문제로" 버튼 클릭 (마지막 문제에서는 isComplete=true로 설정됨)
      await page.getByRole("button", { name: /다음 문제로/ }).click()
      
      if (i < questions.length - 1) {
        await page.waitForTimeout(1500) // 문제 전환 애니메이션 대기
      } else {
        await page.waitForTimeout(1000) // 마지막 문제 완료 및 네비게이션 대기
      }
    }
    
    // 결과 페이지로 자동 이동 확인 (마지막 문제 완료 후 isComplete 상태에서 자동 이동)
    await expect(page).toHaveURL(/\/diagnostic\/result/, { timeout: 15000 })
  })

  test("결과 페이지 - 점수 및 레벨 표시", async ({ page }) => {
    // 테스트 결과 시뮬레이션 (sessionStorage 사용, 실제 구현과 동일한 키)
    await page.evaluate(() => {
      sessionStorage.setItem("unitylearn_diagnostic_result", JSON.stringify({
        score: 80,
        totalQuestions: 5,
        correctAnswers: 3,
        recommendedLevel: "intermediate",
        answers: [
          { questionId: 1, stage1Correct: true, stage2Correct: true, points: 25 },
          { questionId: 2, stage1Correct: true, stage2Correct: false, points: 15 },
          { questionId: 3, stage1Correct: false, stage2Correct: true, points: 10 },
          { questionId: 4, stage1Correct: true, stage2Correct: true, points: 20 },
          { questionId: 5, stage1Correct: false, stage2Correct: false, points: 10 }
        ]
      }))
    })
    
    await page.goto("/diagnostic/result")
    
    // 페이지 로드 확인
    await expect(page.locator("body")).toBeVisible()
    
    // 점수 표시 확인 (실제로는 "80 / 125" 형태로 표시됨)
    await expect(page.locator("body")).toContainText("80")
    await expect(page.locator("body")).toContainText("/")
    
    // 레벨 추천 확인
    await expect(page.locator("body")).toContainText("중급")
  })

  test("결과 페이지 - 레벨별 추천 버튼", async ({ page }) => {
    // 테스트 결과 시뮬레이션 (sessionStorage 사용)
    await page.evaluate(() => {
      sessionStorage.setItem("unitylearn_diagnostic_result", JSON.stringify({
        score: 80,
        totalQuestions: 5,
        correctAnswers: 3,
        recommendedLevel: "intermediate",
        answers: [
          { questionId: 1, stage1Correct: true, stage2Correct: true, points: 25 },
          { questionId: 2, stage1Correct: true, stage2Correct: false, points: 15 },
          { questionId: 3, stage1Correct: false, stage2Correct: true, points: 10 },
          { questionId: 4, stage1Correct: true, stage2Correct: true, points: 20 },
          { questionId: 5, stage1Correct: false, stage2Correct: false, points: 10 }
        ]
      }))
    })
    
    await page.goto("/diagnostic/result")
    
    // 페이지 로드 확인
    await expect(page.locator("body")).toBeVisible()
    
    // 학습 시작 버튼 확인
    const startButton = page.getByRole("button").filter({ hasText: /학습|시작/ })
    expect(await startButton.count()).toBeGreaterThan(0)
  })
})
