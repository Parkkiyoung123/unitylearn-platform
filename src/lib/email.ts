import { Resend } from "resend"

// API 키가 없을 때는 콘솔에만 로그하는 Mock 객체 사용
const resendApiKey = process.env.RESEND_API_KEY

export const resend = resendApiKey 
  ? new Resend(resendApiKey)
  : {
      emails: {
        send: async (options: any) => {
          console.log("[MOCK EMAIL] Email would be sent:", options)
          return { id: "mock-email-id", data: null }
        }
      }
    } as any
