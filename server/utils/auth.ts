import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'

export interface JwtPayload {
  sub: string  // user id
  role: 'sw' | 'taxi' | 'admin'
  iat?: number
  exp?: number
}

const COOKIE_NAME = 'auth_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7  // 7 days

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  const secret = useRuntimeConfig().jwtSecret as string
  if (!secret) throw createError({ statusCode: 500, statusMessage: 'JWT_SECRET is not configured' })
  return jwt.sign(payload, secret, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  const secret = useRuntimeConfig().jwtSecret as string
  return jwt.verify(token, secret) as JwtPayload
}

export function setAuthCookie(event: H3Event, token: string): void {
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

export function clearAuthCookie(event: H3Event): void {
  deleteCookie(event, COOKIE_NAME)
}

export function getTokenFromEvent(event: H3Event): string | null {
  // 1. HttpOnly cookie
  const cookie = getCookie(event, COOKIE_NAME)
  if (cookie) return cookie

  // 2. Authorization: Bearer <token>
  const authHeader = getHeader(event, 'authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  return null
}

export function requireAuth(event: H3Event): JwtPayload {
  const token = getTokenFromEvent(event)
  if (!token) throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })

  try {
    return verifyToken(token)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }
}
