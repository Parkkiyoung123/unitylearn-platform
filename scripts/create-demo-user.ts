/**
 * Better Auth 우회 데모 사용자 직접 생성 스크립트
 * 
 * Prisma를 사용해 데이터베이스에 직접 테스트 사용자를 생성합니다.
 * Better Auth의 낮은 수준 API를 우회하여 사용자를 생성합니다.
 * 
 * 실행: npx tsx scripts/create-demo-user.ts
 */

import { PrismaClient, UserLevel } from "@prisma/client"
import { hash } from "bcryptjs"
import crypto from "crypto"

const prisma = new PrismaClient()

// ============================================================================
// 테스트 계정 설정
// ============================================================================

const DEMO_USER = {
  email: "demo@unitylearn.com",
  name: "데모 사용자",
  password: "demo1234",
  level: UserLevel.Intermediate,
}

// ============================================================================
// 사용자 생성 함수
// ============================================================================

/**
 * 데모 사용자 생성 (Better Auth 우회)
 * 
 * 1. User 테이블에 사용자 기본 정보 생성
 * 2. Account 테이블에 비밀번호 인증 정보 생성 (providerId: "credential")
 * 3. UserProgress 테이블에 학습 진도 생성
 */
async function createDemoUser() {
  console.log("\n🚀 Creating demo user (bypassing Better Auth)...\n")

  // 기존 사용자 확인
  const existingUser = await prisma.user.findUnique({
    where: { email: DEMO_USER.email },
  })

  if (existingUser) {
    console.log("⚠️  Demo user already exists!")
    console.log(`   Email: ${DEMO_USER.email}`)
    console.log(`   User ID: ${existingUser.id}`)
    console.log("\n📝 To recreate, delete the existing user first:\n")
    console.log(`   npx prisma studio  # Then delete user with email: ${DEMO_USER.email}`)
    return existingUser
  }

  // 비밀번호 해싱 (Better Auth는 bcrypt 사용)
  console.log("🔐 Hashing password with bcryptjs...")
  const hashedPassword = await hash(DEMO_USER.password, 10)
  console.log("   ✅ Password hashed successfully")

  // 1. User 모델에 사용자 생성
  console.log("\n👤 Creating User record...")
  const userId = crypto.randomUUID()
  const user = await prisma.user.create({
    data: {
      id: userId,
      email: DEMO_USER.email,
      emailVerified: true,  // 이메일 인증 완료 상태
      name: DEMO_USER.name,
      image: null,
      level: DEMO_USER.level,
      streak: 5,
    },
  })
  console.log(`   ✅ User created: ${user.id}`)

  // 2. Account 모델에 비밀번호 계정 생성
  console.log("\n🔑 Creating Account record (credential provider)...")
  const account = await prisma.account.create({
    data: {
      id: crypto.randomUUID(),
      userId: user.id,
      accountId: user.email,  // Better Auth는 email을 accountId로 사용
      providerId: "credential",  // 비밀번호 기반 인증 제공자
      password: hashedPassword,  // bcrypt 해시된 비밀번호
    },
  })
  console.log(`   ✅ Account created: ${account.id}`)

  // 3. UserProgress 모델에 진도 생성
  console.log("\n📊 Creating UserProgress record...")
  const progress = await prisma.userProgress.create({
    data: {
      userId: user.id,
      currentLevel: DEMO_USER.level,
      totalAttempts: 10,
      correctCount: 7,
      accuracy: 70.0,
      streakDays: 5,
      lastAttemptDate: new Date(),
      weeklyGoal: 10,
      categoryProgress: {
        "NullReferenceException": { attempts: 3, correct: 2, completed: [] },
        "Performance": { attempts: 2, correct: 2, completed: [] },
        "Physics": { attempts: 3, correct: 2, completed: [] },
        "Animation": { attempts: 1, correct: 0, completed: [] },
        "UI": { attempts: 1, correct: 1, completed: [] },
      },
    },
  })
  console.log(`   ✅ UserProgress created: ${progress.id}`)

  return user
}

// ============================================================================
// 로그인 검증 함수
// ============================================================================

/**
 * 생성된 사용자로 로그인 가능한지 확인
 */
async function verifyUserCreation(userId: string) {
  console.log("\n🔍 Verifying user creation...\n")

  // User 조회
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      accounts: true,
      progress: true,
    },
  })

  if (!user) {
    throw new Error("User not found after creation!")
  }

  console.log("✅ User record:")
  console.log(`   ID: ${user.id}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Name: ${user.name}`)
  console.log(`   Level: ${user.level}`)
  console.log(`   Streak: ${user.streak}`)
  console.log(`   Email Verified: ${user.emailVerified}`)

  console.log("\n✅ Account record:")
  if (user.accounts.length > 0) {
    const account = user.accounts[0]
    console.log(`   ID: ${account.id}`)
    console.log(`   Provider: ${account.providerId}`)
    console.log(`   Account ID: ${account.accountId}`)
    console.log(`   Has Password: ${!!account.password}`)
  } else {
    console.log("   ⚠️  No account record found!")
  }

  console.log("\n✅ UserProgress record:")
  if (user.progress) {
    console.log(`   ID: ${user.progress.id}`)
    console.log(`   Current Level: ${user.progress.currentLevel}`)
    console.log(`   Total Attempts: ${user.progress.totalAttempts}`)
    console.log(`   Correct Count: ${user.progress.correctCount}`)
    console.log(`   Accuracy: ${user.progress.accuracy}%`)
    console.log(`   Streak Days: ${user.progress.streakDays}`)
  } else {
    console.log("   ⚠️  No progress record found!")
  }

  return user
}

// ============================================================================
// 메인 실행 함수
// ============================================================================

async function main() {
  console.log("=" .repeat(60))
  console.log("🌟 UnityLearn Demo User Creator")
  console.log("   (Bypassing Better Auth)")
  console.log("=".repeat(60))

  try {
    // 1. 데모 사용자 생성
    const user = await createDemoUser()

    // 2. 생성 확인
    await verifyUserCreation(user.id)

    // 3. 완료 메시지
    console.log("\n" + "=".repeat(60))
    console.log("✨ Demo user created successfully!")
    console.log("=".repeat(60))
    console.log("\n📋 User Details:")
    console.log(`   User ID: ${user.id}`)
    console.log(`   Email: ${DEMO_USER.email}`)
    console.log(`   Password: ${DEMO_USER.password}`)
    console.log(`   Name: ${DEMO_USER.name}`)
    console.log(`   Level: ${DEMO_USER.level}`)
    console.log("")
    console.log("🔑 Login Credentials:")
    console.log(`   Email: ${DEMO_USER.email}`)
    console.log(`   Password: ${DEMO_USER.password}`)
    console.log("")
    console.log("🌐 Login URL:")
    console.log("   http://localhost:3000/auth/signin")
    console.log("")
    console.log("✅ Verification Methods:")
    console.log("   1. Login with above credentials on the signin page")
    console.log("   2. Check Prisma Studio: npx prisma studio")
    console.log("   3. Query database: SELECT * FROM users WHERE email = 'demo@unitylearn.com';")
    console.log("")
    console.log("📝 Note:")
    console.log("   This user bypasses Better Auth's normal flow.")
    console.log("   All Better Auth features (sessions, etc.) will work normally.")
    console.log("=".repeat(60) + "\n")

  } catch (error) {
    console.error("\n❌ Failed to create demo user:\n")
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`)
      console.error(`   Stack: ${error.stack}`)
    } else {
      console.error(error)
    }
    
    console.error("\n💡 Troubleshooting:")
    console.error("   1. Ensure DATABASE_URL is set in .env")
    console.error("   2. Run migrations: npx prisma migrate dev")
    console.error("   3. Install bcryptjs: npm install bcryptjs @types/bcryptjs")
    console.error("   4. Check database connection\n")
    
    throw error
  }
}

// ============================================================================
// 스크립트 실행
// ============================================================================

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
