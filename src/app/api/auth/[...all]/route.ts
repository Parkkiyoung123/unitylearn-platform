import { auth } from "@/lib/auth"
import { NextRequest } from "next/server"

const handler = auth.handler

export const GET = handler
export const POST = handler
export const PUT = handler
export const DELETE = handler
export const PATCH = handler
