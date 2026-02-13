/**
 * Database Warmup API Route (P5 Phase에서 활성화)
 * 
 * 현재는 P4 Phase 테스트를 위해 비활성화되어 있습니다.
 * P5 Phase에서 Prisma 스키마가 Neon PostgreSQL로 마이그레이션되면 활성화됩니다.
 * 
 * @route GET /api/db-warmup
 * @cron 5분마다 실행 (P5에서 활성화 예정)
 */

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'disabled',
    message: 'Database warmup is disabled during P4 testing. Will be enabled in P5 Phase when Neon PostgreSQL schema migration is complete.',
    phase: 'P4-Testing',
    timestamp: new Date().toISOString()
  })
}

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
