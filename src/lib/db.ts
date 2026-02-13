/**
 * Database Client 관리
 * 
 * P4 Phase 테스트를 위해 기존 SQLite Prisma Client 유지
 * P5 Phase에서 Neon PostgreSQL로 마이그레이션 예정
 * 
 * @author Database Architecture Team
 * @since 2024
 */

import { PrismaClient } from '@prisma/client'

// ============================================================================
// Prisma Client 싱글톤 인스턴스
// ============================================================================

const globalForPrisma = globalThis as unknown as {
  __prisma__: PrismaClient | undefined
}

/**
 * Prisma Client 생성
 * 
 * P4 Phase: SQLite (기존 설정 유지)
 * P5 Phase: Neon PostgreSQL로 마이그레이션 예정
 */
function createPrismaClient(): PrismaClient {
  const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'info', 'warn', 'error']
      : ['error'],
  })

  return prisma
}

/**
 * Prisma Client 싱글톤 getter
 */
export function getPrisma(): PrismaClient {
  if (!globalForPrisma.__prisma__) {
    globalForPrisma.__prisma__ = createPrismaClient()
  }
  return globalForPrisma.__prisma__
}

/**
 * 기본 Prisma Client 인스턴스
 * 기존 코드와의 호환성을 위해 제공
 */
export const prisma = getPrisma()

// ============================================================================
// Neon PostgreSQL 설정 (P5에서 활성화 예정)
// ============================================================================

/**
 * Neon Connection Pool 설정 (P5에서 활성화)
 * 현재는 타입 정의만 제공
 */
export interface PoolConfig {
  connectionString: string
  max: number
  connectionTimeoutMillis: number
  idleTimeoutMillis: number
  maxUses: number
}

/**
 * Pool Metrics 타입
 */
export interface PoolMetrics {
  totalCount: number
  idleCount: number
  waitingCount: number
}

/**
 * 데이터베이스 설정 타입
 */
export interface DatabaseConfig {
  url: string
  poolSize: number
  connectionTimeout: number
  maxUses: number
  idleTimeout: number
}

// ============================================================================
// Database Health Check (Mock for P4)
// ============================================================================

/**
 * 데이터베이스 연결 헬스체크 (P4)
 * 기존 Prisma Client 사용
 */
export async function checkDatabaseHealth(): Promise<{
  healthy: boolean
  latency: number
  error?: string
}> {
  const start = performance.now()
  
  try {
    const client = getPrisma()
    await client.$queryRaw`SELECT 1`
    const end = performance.now()
    
    return {
      healthy: true,
      latency: Math.round(end - start),
    }
  } catch (error) {
    const end = performance.now()
    return {
      healthy: false,
      latency: Math.round(end - start),
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Pool 상태 조회 (P5에서 구현)
 * 현재는 mock 데이터 반환
 */
export async function getPoolMetrics(): Promise<PoolMetrics> {
  return {
    totalCount: 1,
    idleCount: 0,
    waitingCount: 0,
  }
}

/**
 * Pool 종료 (Graceful Shutdown)
 */
export async function closePool(): Promise<void> {
  const prisma = globalForPrisma.__prisma__
  if (prisma) {
    await prisma.$disconnect()
    globalForPrisma.__prisma__ = undefined
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[DB] Prisma disconnected gracefully')
    }
  }
}

// ============================================================================
// Query Helper Functions
// ============================================================================

/**
 * 트랜잭션 헬퍼
 */
export async function withTransaction<T>(
  callback: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = getPrisma()
  return await prisma.$transaction(async (tx) => {
    return await callback(tx as unknown as PrismaClient)
  })
}

/**
 * 재시도 로직이 포함된 쿼리 실행
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxRetries?: number
    retryDelay?: number
    retryableErrors?: string[]
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryableErrors = ['connection', 'timeout', 'ECONNRESET', 'ETIMEDOUT'],
  } = options

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      const isRetryable = retryableErrors.some(errType =>
        lastError!.message.toLowerCase().includes(errType.toLowerCase())
      )

      if (!isRetryable || attempt === maxRetries) {
        throw lastError
      }

      const delay = retryDelay * Math.pow(2, attempt - 1)
      
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          `[DB] Query failed (attempt ${attempt}/${maxRetries}), ` +
          `retrying in ${delay}ms...`
        )
      }
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}

/**
 * 현재 연결 설정 정보 반환
 */
export function getDatabaseInfo(): {
  url: string
  connected: boolean
  phase: string
} {
  return {
    url: 'sqlite://dev.db (P4 Phase)',
    connected: true,
    phase: 'P4-Testing',
  }
}

// ============================================================================
// Process Lifecycle Hooks
// ============================================================================

if (typeof process !== 'undefined') {
  process.on('SIGTERM', async () => {
    console.log('[DB] SIGTERM received, disconnecting...')
    await closePool()
    process.exit(0)
  })

  process.on('SIGINT', async () => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DB] SIGINT received, disconnecting...')
      await closePool()
    }
    process.exit(0)
  })
}
