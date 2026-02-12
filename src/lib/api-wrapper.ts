import { NextRequest, NextResponse } from "next/server"
import { Ratelimit } from "@upstash/ratelimit"
import { handleError } from "./error-handler"

type ApiHandler = (req: NextRequest) => Promise<Response>

export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req) => {
    try {
      return await handler(req)
    } catch (error) {
      return handleError(error)
    }
  }
}

export function withRateLimit(
  handler: ApiHandler,
  ratelimiter: Ratelimit
): ApiHandler {
  return async (req) => {
    const ip = req.ip ?? "anonymous"
    const { success, limit, remaining, reset } = await ratelimiter.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded", reset },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          }
        }
      )
    }

    const response = await handler(req)
    
    // Rate limit 헤더 추가
    response.headers.set("X-RateLimit-Limit", limit.toString())
    response.headers.set("X-RateLimit-Remaining", remaining.toString())
    
    return response
  }
}
