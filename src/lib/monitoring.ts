interface ErrorLog {
  timestamp: string
  code: string
  message: string
  stack?: string
  context?: Record<string, unknown>
}

export function logError(error: Error, context?: Record<string, unknown>) {
  const errorLog: ErrorLog = {
    timestamp: new Date().toISOString(),
    code: error.name,
    message: error.message,
    stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    context,
  }

  // 개발 환경에서는 콘솔에 출력
  console.error("[ERROR]", errorLog)

  // 프로덕션에서는 Sentry 등으로 전송 가능
  if (process.env.NODE_ENV === "production") {
    // TODO: Sentry integration
    // Sentry.captureException(error, { extra: context })
  }
}

export function logAuthEvent(
  event: "signin" | "signup" | "signout" | "reset_password",
  userId: string,
  success: boolean,
  metadata?: Record<string, unknown>
) {
  console.log("[AUTH]", {
    event,
    userId,
    success,
    timestamp: new Date().toISOString(),
    ...metadata,
  })
}
