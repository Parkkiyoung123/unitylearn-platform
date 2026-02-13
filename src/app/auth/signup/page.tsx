import { SignUpForm } from "@/components/auth/sign-up-form"
import { OAuthButtons } from "@/components/auth/oauth-buttons"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">회원가입</h1>
          <p className="mt-2 text-gray-600">
            UnityLearn에서 학습을 시작하세요
          </p>
        </div>

        <OAuthButtons />

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">또는 이메일로 가입</span>
          </div>
        </div>

        <SignUpForm />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <Link href="/auth/signin" className="text-blue-600 hover:text-blue-500">
              로그인
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
