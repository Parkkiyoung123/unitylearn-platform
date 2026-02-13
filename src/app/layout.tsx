import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SessionProvider } from "@/components/providers/SessionProvider";

/**
 * Pretendard - Korean-optimized variable font
 * Perfect for Korean content with excellent readability
 */
const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  variable: "--font-pretendard",
  weight: "100 900",
  display: "swap",
  fallback: [
    "-apple-system",
    "BlinkMacSystemFont",
    "system-ui",
    "Roboto",
    "Helvetica Neue",
    "Segoe UI",
    "Apple SD Gothic Neo",
    "Noto Sans KR",
    "Malgun Gothic",
    "sans-serif",
  ],
});

export const metadata: Metadata = {
  title: "UnityLearn - Unity 버그 진단 및 학습 플랫폼",
  description: "Unity 개발자를 위한 버그 진단 테스트와 학습 콘텐츠. 실전 버그 시나리오를 통해 문제 해결 능력을 키워보세요.",
  keywords: ["Unity", "버그", "진단", "학습", "게임개발", "디버깅"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${pretendard.variable} font-sans antialiased min-h-screen`}
        style={{ fontFamily: "var(--font-pretendard), -apple-system, BlinkMacSystemFont, system-ui, sans-serif" }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <SessionProvider>
            <Navbar />
            <main className="pt-0">{children}</main>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
