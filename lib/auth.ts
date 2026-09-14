import jwt from "jsonwebtoken"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me"

export interface AdminTokenPayload {
  adminId: string
  phone: string
}

export function signAdminToken(payload: AdminTokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminTokenPayload
  } catch {
    return null
  }
}

/* Reads the Bearer token from the request and returns the decoded admin payload, or null. */
export function getAdminFromRequest(req: NextRequest): AdminTokenPayload | null {
  const header = req.headers.get("authorization") || ""
  const token = header.startsWith("Bearer ") ? header.slice(7) : ""
  if (!token) return null
  return verifyAdminToken(token)
}
