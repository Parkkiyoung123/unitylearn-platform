import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./db"

// 환경변수 체크 - 이메일 설정이 있을 때만 이메일 기능 활성화
const hasEmailConfig = process.env.RESEND_API_KEY 

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  // 테스트 환경을 위한 trusted origins 설정 - 동적 포트 대응
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://localhost:3005",
    "http://localhost:3006",
    "http://localhost:3007",
    "http://localhost:3008",
    "http://localhost:3009",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
    "http://127.0.0.1:3004",
    "http://127.0.0.1:3005",
    "http://127.0.0.1:3006",
    "http://127.0.0.1:3007",
    "http://127.0.0.1:3008",
    "http://127.0.0.1:3009",
  ],
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    // 이메일 설정이 있을 때만 이메일 전송 함수 설정
    ...(hasEmailConfig && {
      sendResetPassword: async ({ user, url }) => {
        const { resend } = await import("./email")
        await resend.emails.send({
          from: process.env.FROM_EMAIL || "noreply@unitylearn.com",
          to: user.email,
          subject: "비밀번호 재설정",
          html: `
            <h1>비밀번호 재설정</h1>
            <p>안녕하세요, ${user.name || user.email}님</p>
            <p>비밀번호 재설정을 요청하셨습니다. 아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">비밀번호 재설정</a>
            <p>또는 다음 링크를 복사하여 브라우저에 붙여넣으세요: ${url}</p>
            <p>이 요청을 하지 않으셨다면 이 이메일을 무시하셔도 됩니다.</p>
          `,
        })
      },
      sendVerificationEmail: async ({ user, url }) => {
        const { resend } = await import("./email")
        await resend.emails.send({
          from: process.env.FROM_EMAIL || "noreply@unitylearn.com",
          to: user.email,
          subject: "이메일 인증",
          html: `
            <h1>이메일 인증</h1>
            <p>안녕하세요, ${user.name || user.email}님</p>
            <p>UnityLearn에 가입해 주셔서 감사합니다. 아래 버튼을 클릭하여 이메일을 인증하세요:</p>
            <a href="${url}" style="display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 6px;">이메일 인증하기</a>
            <p>또는 다음 링크를 복사하여 브라우저에 붙여넣으세요: ${url}</p>
          `,
        })
      },
    }),
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
  },
})

export type Auth = typeof auth
