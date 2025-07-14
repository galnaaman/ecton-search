import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'
import { prisma } from './prisma'

export interface AuthUser {
  id: string
  username: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: '24h' }
  )
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser
    return decoded
  } catch (error) {
    return null
  }
}

export async function authenticateRequest(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const decoded = verifyToken(token)
  
  if (!decoded) {
    return null
  }

  // Verify user still exists in database
  const user = await prisma.user.findUnique({
    where: { id: decoded.id }
  })

  if (!user) {
    return null
  }

  return {
    id: user.id,
    username: user.username,
    role: user.role
  }
}

export async function createDefaultAdmin(): Promise<void> {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUsername }
  })

  if (!existingAdmin) {
    const hashedPassword = await hashPassword(adminPassword)
    await prisma.user.create({
      data: {
        username: adminUsername,
        passwordHash: hashedPassword,
        role: 'admin'
      }
    })
    console.log(`Default admin user created: ${adminUsername}`)
  }
}

// Role-based permission checks
export function canManageSites(role: string): boolean {
  return role === 'technical' || role === 'admin'
}

export function canViewAnalytics(role: string): boolean {
  return role === 'admin'
}

export function canManageCMS(role: string): boolean {
  return role === 'admin'
}

export function canAccessDeveloperPortal(role: string): boolean {
  return role === 'technical' || role === 'admin'
}