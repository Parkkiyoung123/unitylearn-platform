"use client"

import { OAuthButtons } from "@/components/auth/oauth-buttons"
import { SignInForm } from "@/components/auth/sign-in-form"
import Link from "next/link"
import { Suspense } from "react"

export default function SignInPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            다시 오신 것을 환영합니다
          </h1>
          <p className="text-sm text-muted-foreground">
            계정에 로그인하여 학습을 계속하세요
          </p>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <OAuthButtons />
        </Suspense>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              또는
            </span>
          </div>
        </div>

        <Suspense fallback={<div>Loading...</div>}>
          <SignInForm />
        </Suspense>

        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link
            href="/auth/reset-password"
            className="hover:text-brand underline underline-offset-4"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </p>

        <p className="px-8 text-center text-sm text-muted-foreground">
          계정이 없으신가요?{" "}
          <Link
            href="/auth/signup"
            className="hover:text-brand underline underline-offset-4"
          >
            회원가입
          </Link>
        </p>
      </div>
    </div>
  )
}
