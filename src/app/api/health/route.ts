/**
 * Database Health Check API Route
 * 
 * 데이터베이스 연결 상태를 확인하는 엔드포인트
 * 
 * @route GET /api/health
 */

import { checkDatabaseHealth, getPoolMetrics } from '@/lib/db'

export async function GET(): Promise<Response> {
  const startTime = performance.now()
  
  try {
    const [health, metrics] = await Promise.all([
      checkDatabaseHealth(),
      getPoolMetrics(),
    ])

    const duration = Math.round(performance.now() - startTime)

    return new Response(
      JSON.stringify({
        status: health.healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: health.healthy ? 'up' : 'down',
            latency: health.latency,
            ...(!health.healthy && { error: health.error }),
          },
        },
        metrics: {
          responseTime: duration,
          pool: {
            total: metrics.totalCount,
            idle: metrics.idleCount,
            waiting: metrics.waitingCount,
          },
        },
      }),
      {
        status: health.healthy ? 200 : 503,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return new Response(
      JSON.stringify({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
