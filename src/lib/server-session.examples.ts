/**
 * Server Session Test Examples
 * 
 * Server Components와 Server Actions에서 세션 관리를 사용하는 예시
 */

// =============================================================================
// Server Component Examples
// =============================================================================

/**
 * @example Server Component에서 세션 사용
 * 
 * ```tsx
 * // app/dashboard/page.tsx
 * import { getSession, getAuthenticatedSession } from "@/lib/server-session"
 * import { redirect } from "next/navigation"
 * 
 * export default async function DashboardPage() {
 *   // 방법 1: 모든 세션 가져오기 (인증된 사용자 + 게스트)
 *   const session = await getSession()
 *   
 *   if (!session) {
 *     redirect("/auth/signin")
 *   }
 *   
 *   // 방법 2: 인증된 사용자만
 *   const authSession = await getAuthenticatedSession()
 *   
 *   if (!authSession) {
 *     return (
 *       <div>
 *         <h1>게스트 모드</h1>
 *         <p>일부 기능은 로그인 후 사용 가능합니다</p>
 *       </div>
 *     )
 *   }
 *   
 *   return (
 *     <div>
 *       <h1>대시보드</h1>
 *       <p>안녕하세요, {authSession.email}님</p>
 *     </div>
 *   )
 * }
 * ```
 */

/**
 * @example withSession 사용 예시
 * 
 * ```tsx
 * // app/profile/page.tsx
 * import { withAuthenticatedSession } from "@/lib/server-session"
 * import { prisma } from "@/lib/db"
 * 
 * async function getUserData(userId: string) {
 *   return await prisma.user.findUnique({
 *     where: { id: userId },
 *     include: { profile: true }
 *   })
 * }
 * 
 * export default async function ProfilePage() {
 *   try {
 *     const userData = await withAuthenticatedSession(
 *       (session) => getUserData(session.userId),
 *       { errorMessage: "프로필을 볼려면 로그인이 필요합니다" }
 *     )
 *     
 *     return <ProfileView user={userData} />
 *   } catch (error) {
 *     return <LoginRedirect message={error.message} />
 *   }
 * }
 * ```
 */

/**
 * @example 다중 세션 조회 (cache() 덕분에 한 번만 조회됨)
 * 
 * ```tsx
 * // app/layout.tsx
 * import { getSession } from "@/lib/server-session"
 * 
 * export default async function RootLayout({
 *   children,
 * }: {
 *   children: React.ReactNode
 * }) {
 *   // 동일한 요청 내에서 여러 번 호출핵도 한 번만 쿠키를 읽음
 *   const session = await getSession()
 *   
 *   return (
 *     <html>
 *       <body>
 *         <Navbar user={session} />
 *         {children}
 *         <Footer />
 *       </body>
 *     </html>
 *   )
 * }
 * 
 * // components/Navbar.tsx (Server Component)
 * import { getSession } from "@/lib/server-session"
 * 
 * export async function Navbar() {
 *   // layout.tsx와 동일한 요청이므로 캐시된 세션 사용
 *   const session = await getSession()
 *   
 *   return (
 *     <nav>
 *       {session?.isGuest ? (
 *         <GuestNav />
 *       ) : session ? (
 *         <UserNav email={session.email} />
 *       ) : (
 *         <AnonymousNav />
 *       )}
 *     </nav>
 *   )
 * }
 * ```
 */

// =============================================================================
// Server Action Examples
// =============================================================================

/**
 * @example Server Action에서 세션 사용
 * 
 * ```ts
 * // app/actions/quiz.ts
 * "use server"
 * 
 * import { 
 *   getSession, 
 *   requireAuth, 
 *   requireAuthenticatedUser 
 * } from "@/lib/server-actions-session"
 * import { prisma } from "@/lib/db"
 * 
 * // 모든 사용자 (게스트 포함)
 * export async function saveQuizAttempt(quizId: string, score: number) {
 *   const session = await getSession()
 *   
 *   if (!session) {
 *     return { error: "세션이 필요합니다" }
 *   }
 *   
 *   const userId = session.isGuest ? session.id : session.userId
 *   
 *   await prisma.quizAttempt.create({
 *     data: {
 *       quizId,
 *       score,
 *       userId,
 *       isGuest: session.isGuest,
 *     }
 *   })
 *   
 *   return { success: true }
 * }
 * 
 * // 인증된 사용자만
 * export async function saveToFavorites(quizId: string) {
 *   try {
 *     const session = await requireAuth()
 *     
 *     await prisma.favorite.create({
 *       data: {
 *         quizId,
 *         userId: session.userId,
 *       }
 *     })
 *     
 *     return { success: true }
 *   } catch (error) {
 *     if (error instanceof AuthError) {
 *       return { error: error.message }
 *     }
 *     throw error
 *   }
 * }
 * 
 * // 게스트는 사용 불가
 * export async function purchasePremium() {
 *   try {
 *     const session = await requireAuthenticatedUser()
 *     
 *     // 여기서는 인증된 사용자만 접근 가능
 *     await createPayment(session.userId)
 *     
 *     return { success: true }
 *   } catch (error) {
 *     if (error instanceof AuthError) {
 *       return { 
 *         error: error.message,
 *         code: error.code,
 *         requiresSignup: error.code === "GUEST_NOT_ALLOWED"
 *       }
 *     }
 *     throw error
 *   }
 * }
 * ```
 */

/**
 * @example Form Action with Auth
 * 
 * ```tsx
 * // app/profile/edit/EditProfileForm.tsx
 * "use server"
 * 
 * import { withAuthFormAction } from "@/lib/server-actions-session"
 * import { prisma } from "@/lib/db"
 * import { revalidatePath } from "next/cache"
 * 
 * export const updateProfile = withAuthFormAction(async (session, formData) => {
 *   const name = formData.get("name") as string
 *   const bio = formData.get("bio") as string
 *   
 *   await prisma.user.update({
 *     where: { id: session.userId },
 *     data: { name, bio }
 *   })
 *   
 *   revalidatePath("/profile")
 *   
 *   return { success: true, message: "프로필이 업데이트되었습니다" }
 * })
 * 
 * // 클라이언트 컴포넌트에서 사용
 * "use client"
 * 
 * export function EditProfileForm() {
 *   async function handleSubmit(formData: FormData) {
 *     const result = await updateProfile(formData)
 *     
 *     if ("error" in result) {
 *       toast.error(result.error)
 *     } else {
 *       toast.success(result.message)
 *     }
 *   }
 *   
 *   return (
 *     <form action={handleSubmit}>
 *       <input name="name" />
 *       <textarea name="bio" />
 *       <button type="submit">저장</button>
 *     </form>
 *   )
 * }
 * ```
 */

/**
 * @example Redirect on Auth Failure
 * 
 * ```ts
 * // app/actions/settings.ts
 * "use server"
 * 
 * import { authOrRedirect } from "@/lib/server-actions-session"
 * 
 * export async function getUserSettings() {
 *   // 인증되지 않으면 /auth/signin으로 리다이렉트
 *   const session = await authOrRedirect("/auth/signin")
 *   
 *   const settings = await prisma.settings.findUnique({
 *     where: { userId: session.userId }
 *   })
 *   
 *   return settings
 * }
 * ```
 */

// =============================================================================
// Client Component Integration
// =============================================================================

/**
 * @example 서버 세션을 클라이언트로 전달
 * 
 * ```tsx
 * // app/layout.tsx (Server Component)
 * import { getSession } from "@/lib/server-session"
 * import { SessionProvider } from "@/components/providers/SessionProvider"
 * 
 * export default async function RootLayout({ children }) {
 *   const session = await getSession()
 *   
 *   return (
 *     <SessionProvider initialSession={session}>
 *       {children}
 *     </SessionProvider>
 *   )
 * }
 * 
 * // components/providers/SessionProvider.tsx (Client Component)
 * "use client"
 * 
 * import { createContext, useContext } from "react"
 * import type { Session } from "@/types/session"
 * 
 * const SessionContext = createContext<Session | null>(null)
 * 
 * export function SessionProvider({
 *   children,
 *   initialSession,
 * }: {
 *   children: React.ReactNode
 *   initialSession: Session | null
 * }) {
 *   return (
 *     <SessionContext.Provider value={initialSession}>
 *       {children}
 *     </SessionContext.Provider>
 *   )
 * }
 * 
 * export const useServerSession = () => useContext(SessionContext)
 * ```
 */

// =============================================================================
// Testing Examples
// =============================================================================

/**
 * @example Testing Server Session
 * 
 * ```ts
 * // __tests__/server-session.test.ts
 * import { getSession, getAuthenticatedSession } from "@/lib/server-session"
 * import { cookies } from "next/headers"
 * 
 * // Mock next/headers
 * jest.mock("next/headers", () => ({
 *   cookies: jest.fn()
 * }))
 * 
 * describe("Server Session", () => {
 *   it("should return null when no session cookie exists", async () => {
 *     (cookies as jest.Mock).mockReturnValue({
 *       get: jest.fn().mockReturnValue(undefined)
 *     })
 *     
 *     const session = await getSession()
 *     expect(session).toBeNull()
 *   })
 *   
 *   it("should return authenticated session when valid JWT exists", async () => {
 *     const mockPayload = {
 *       sub: "user123",
 *       email: "test@example.com",
 *       name: "Test User",
 *       iat: Date.now() / 1000,
 *       exp: (Date.now() / 1000) + 3600,
 *     }
 *     
 *     const mockToken = createMockJwt(mockPayload)
 *     
 *     (cookies as jest.Mock).mockReturnValue({
 *       get: jest.fn().mockImplementation((name) => {
 *         if (name === "better-auth.session_token") {
 *           return { value: mockToken }
 *         }
 *         return undefined
 *       })
 *     })
 *     
 *     const session = await getSession()
 *     expect(session).not.toBeNull()
 *     expect(session?.isGuest).toBe(false)
 *     expect((session as AuthenticatedSession).email).toBe("test@example.com")
 *   })
 * })
 * ```
 */

export {}
