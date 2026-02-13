/**
 * Neon Database Cold Start 웜업 모듈
 * 
 * Serverless 환경의 Cold Start 문제 해결:
 * 1. 주기적인 연결 유지 (Keep-alive)
 * 2. 커넥션 풀 사전 초기화
 * 3. 주기적 헬스체크
 * 
 * 사용법:
 * - API Route: /api/db-warmup
 * - Vercel Cron: 5분마다 자동 실행
 * - 수동 호출: warmup() 함수 직접 호출
 * 
 * @author Database Architecture Team
 * @since 2024
 */

import { getPool, checkDatabaseHealth, getPoolMetrics } from './db'

// ============================================================================
// 타입 정의
// ============================================================================

interface WarmupResult {
  success: boolean
  timestamp: string
  duration: number
  metrics: {
    poolTotal: number
    poolIdle: number
    poolWaiting: number
    queryLatency: number
  }
  error?: string
}

interface WarmupOptions {
  minPoolSize?: number
  healthCheck?: boolean
  verbose?: boolean
}

// ============================================================================
// 상수 정의
// ============================================================================

/**
 * 웜업 설정 상수
 */
const WARMUP_CONFIG = {
  // 최소 유지할 연결 수
  MIN_POOL_SIZE: 2,
  
  // 웜업 쿼리 타임아웃 (ms)
  QUERY_TIMEOUT: 5000,
  
  // 헬스체크 재시도 횟수
  HEALTH_CHECK_RETRIES: 3,
  
  // 헬스체크 재시도 간격 (ms)
  HEALTH_CHECK_RETRY_DELAY: 1000,
} as const

// ============================================================================
// 웜업 함수
// ============================================================================

/**
 * 데이터베이스 웜업 실행
 * 
 * Cold Start를 방지하기 위해:
 * 1. Connection Pool 초기화
 * 2. 최소 연결 수 확보
 * 3. 헬스체크 쿼리 실행
 */
export async function warmup(options: WarmupOptions = {}): Promise<WarmupResult> {
  const startTime = performance.now()
  const timestamp = new Date().toISOString()
  
  const {
    minPoolSize = WARMUP_CONFIG.MIN_POOL_SIZE,
    healthCheck = true,
    verbose = process.env.NODE_ENV === 'development',
  } = options

  try {
    if (verbose) {
      console.log('[DB Warmup] Starting warmup at', timestamp)
    }

    // 1. Pool 초기화 및 연결 확보
    const pool = getPool()
    
    // 최소 연결 수 확보를 위한 쿼리 실행
    const warmupQueries = []
    for (let i = 0; i < minPoolSize; i++) {
      warmupQueries.push(
        pool.query('SELECT 1 as warmup').catch(err => {
          console.warn(`[DB Warmup] Query ${i + 1} failed:`, err.message)
          return null
        })
      )
    }
    
    await Promise.all(warmupQueries)

    // 2. 헬스체크 (선택적)
    let healthLatency = 0
    if (healthCheck) {
      const health = await performHealthCheck()
      if (!health.healthy) {
        throw new Error(`Health check failed: ${health.error}`)
      }
      healthLatency = health.latency
    }

    // 3. Pool 메트릭스 수집
    const metrics = await getPoolMetrics()
    const duration = Math.round(performance.now() - startTime)

    const result: WarmupResult = {
      success: true,
      timestamp,
      duration,
      metrics: {
        poolTotal: metrics.totalCount,
        poolIdle: metrics.idleCount,
        poolWaiting: metrics.waitingCount,
        queryLatency: healthLatency,
      },
    }

    if (verbose) {
      console.log('[DB Warmup] Completed successfully:', {
        duration: `${duration}ms`,
        connections: `${metrics.idleCount}/${metrics.totalCount}`,
        latency: `${healthLatency}ms`,
      })
    }

    return result

  } catch (error) {
    const duration = Math.round(performance.now() - startTime)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    console.error('[DB Warmup] Failed:', errorMessage)

    return {
      success: false,
      timestamp,
      duration,
      metrics: {
        poolTotal: 0,
        poolIdle: 0,
        poolWaiting: 0,
        queryLatency: 0,
      },
      error: errorMessage,
    }
  }
}

/**
 * 재시도 로직이 포함된 헬스체크
 */
async function performHealthCheck(): Promise<{
  healthy: boolean
  latency: number
  error?: string
}> {
  for (let attempt = 1; attempt <= WARMUP_CONFIG.HEALTH_CHECK_RETRIES; attempt++) {
    const result = await checkDatabaseHealth()
    
    if (result.healthy) {
      return result
    }

    if (attempt < WARMUP_CONFIG.HEALTH_CHECK_RETRIES) {
      await new Promise(resolve => 
        setTimeout(resolve, WARMUP_CONFIG.HEALTH_CHECK_RETRY_DELAY)
      )
    }
  }

  // 마지막 시도 결과 반환
  return await checkDatabaseHealth()
}

// ============================================================================
// 스케줄러 (Vercel Cron용)
// ============================================================================

/**
 * 주기적 웜업 스케줄러
 * 
 * Vercel Cron에서 호출되는 핸들러
 */
export async function scheduledWarmup(): Promise<WarmupResult> {
  console.log('[DB Warmup] Scheduled warmup triggered')
  return await warmup({
    minPoolSize: WARMUP_CONFIG.MIN_POOL_SIZE,
    healthCheck: true,
    verbose: true,
  })
}

// ============================================================================
// API Route Handler (Next.js)
// ============================================================================

/**
 * Next.js API Route용 웜업 핸들러
 * 
 * 사용법 (app/api/db-warmup/route.ts):
 * ```typescript
 * import { warmupHandler } from '@/lib/db-warmup'
 * export const GET = warmupHandler
 * ```
 */
export async function warmupHandler(request?: Request): Promise<Response> {
  // 인증 체크 (선택적 - Cron job에서는 Authorization 헤더 확인)
  const isCronRequest = request?.headers.get('authorization')?.includes('Bearer')
  const isVercelCron = request?.headers.get('user-agent')?.includes('vercel-cron')
  
  // API 키 검증 (외부 요청 방지)
  const apiKey = request?.headers.get('x-api-key')
  const expectedKey = process.env.WARMUP_API_KEY
  
  if (!isCronRequest && !isVercelCron && expectedKey && apiKey !== expectedKey) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    )
  }

  try {
    const result = await scheduledWarmup()
    
    return new Response(
      JSON.stringify(result),
      {
        status: result.success ? 200 : 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

// ============================================================================
// 주기적 웜업 (Edge Runtime용)
// ============================================================================

/**
 * Edge Runtime에서 사용 가능한 간소화된 웜업
 * 
 * Vercel Edge Functions에서는 Pool을 사용할 수 없으므로
 * 헬스체크만 수행
 */
export async function edgeWarmup(): Promise<Omit<WarmupResult, 'metrics'> & {
  metrics: Pick<WarmupResult['metrics'], 'queryLatency'>
}> {
  const startTime = performance.now()
  const timestamp = new Date().toISOString()

  try {
    // Edge Runtime에서는 fetch API 사용
    const response = await fetch(`${process.env.VERCEL_URL}/api/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const duration = Math.round(performance.now() - startTime)

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`)
    }

    return {
      success: true,
      timestamp,
      duration,
      metrics: {
        queryLatency: duration,
      },
    }
  } catch (error) {
    const duration = Math.round(performance.now() - startTime)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return {
      success: false,
      timestamp,
      duration,
      metrics: { queryLatency: duration },
      error: errorMessage,
    }
  }
}

// ============================================================================
// 모니터링 및 알림
// ============================================================================

/**
 * 웜업 실패 시 알림 발송 (선택적)
 */
export async function notifyWarmupFailure(result: WarmupResult): Promise<void> {
  if (result.success) return

  // Discord/Slack 웹훅 발송 예시
  const webhookUrl = process.env.ALERT_WEBHOOK_URL
  if (!webhookUrl) return

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `⚠️ Database warmup failed`,
        attachments: [{
          color: 'danger',
          fields: [
            { title: 'Timestamp', value: result.timestamp, short: true },
            { title: 'Duration', value: `${result.duration}ms`, short: true },
            { title: 'Error', value: result.error || 'Unknown', short: false },
          ],
        }],
      }),
    })
  } catch (error) {
    console.error('[DB Warmup] Failed to send alert:', error)
  }
}

// ============================================================================
// CLI / 스크립트용
// ============================================================================

/**
 * 스크립트로 직접 실행 시
 * ```bash
 * npx tsx src/lib/db-warmup.ts
 * ```
 */
if (require.main === module) {
  warmup({ verbose: true })
    .then(result => {
      console.log('Warmup result:', result)
      if (!result.success) {
        process.exit(1)
      }
      process.exit(0)
    })
    .catch(error => {
      console.error('Unexpected error:', error)
      process.exit(1)
    })
}
