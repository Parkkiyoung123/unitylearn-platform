export interface GuestSession {
  id: string
  createdAt: Date
  attempts: number
  maxAttempts: number
  quizResults: GuestQuizResult[]
}

export interface GuestQuizResult {
  quizId: string
  score: number
  answers: Record<string, string>
  completedAt: Date
}

// LocalStorage 키
export const GUEST_SESSION_KEY = "unitylearn_guest_session"
export const GUEST_QUIZ_RESULTS_KEY = "unitylearn_guest_quiz_results"
