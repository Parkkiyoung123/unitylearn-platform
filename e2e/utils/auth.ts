import { Page, expect } from "@playwright/test"

export async function fillSignInForm(
  page: Page,
  email: string,
  password: string
) {
  await page.getByRole("textbox", { name: "이메일" }).fill(email)
  await page.getByRole("textbox", { name: "비밀번호", exact: true }).fill(password)
}

export async function fillSignUpForm(
  page: Page,
  name: string,
  email: string,
  password: string,
  confirmPassword?: string
) {
  // 회원가입 페이지 구조에 맞게 수정 필요
  const nameInput = page.getByRole("textbox").filter({ hasText: /.*/ }).first()
  if (await nameInput.isVisible().catch(() => false)) {
    await nameInput.fill(name)
  }
  
  await page.getByRole("textbox", { name: "이메일" }).fill(email)
  await page.getByRole("textbox", { name: "비밀번호", exact: true }).fill(password)
  
  if (confirmPassword) {
    // 비밀번호 확인 필드
    await page.getByRole("textbox", { name: "비밀번호 확인" }).fill(confirmPassword)
  }
}

export async function submitForm(page: Page) {
  await page.getByRole("button", { name: "로그인" }).click()
}

export async function expectToBeOnDashboard(page: Page) {
  await page.waitForURL("/dashboard")
  await expect(page).toHaveURL("/dashboard")
}

export async function clearLocalStorage(page: Page) {
  // 페이지가 완전히 로드된 후에만 localStorage 접근
  await page.waitForLoadState("networkidle")
  
  await page.evaluate(() => {
    try {
      localStorage.clear()
    } catch (e) {
      console.log("localStorage clear failed:", e)
    }
  })
}
