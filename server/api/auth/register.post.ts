import bcrypt from 'bcryptjs'
import { connectDB } from '~~/server/utils/db'
import { User } from '~~/server/models/User'
import { signToken, setAuthCookie } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await connectDB()

  const body = await readBody<{
    role: 'sw' | 'taxi'
    name: string
    email: string
    password: string
    phone?: string
  }>(event)

  // Validation
  if (!body.role || !body.name || !body.email || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }
  if (!['sw', 'taxi'].includes(body.role)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid role' })
  }
  if (body.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
  }
  if (body.role === 'taxi' && !body.phone) {
    throw createError({ statusCode: 400, statusMessage: 'Phone number is required for taxi operators' })
  }

  // Duplicate check
  const existing = await User.findOne({ email: body.email.toLowerCase() })
  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'このメールアドレスは既に登録されています' })
  }

  const passwordHash = await bcrypt.hash(body.password, 12)
  const user = await User.create({
    role: body.role,
    name: body.name,
    email: body.email,
    passwordHash,
    phone: body.phone ?? '',
  })

  const token = signToken({ sub: user._id.toString(), role: user.role })
  setAuthCookie(event, token)

  return {
    success: true,
    data: {
      token,
      user: {
        id: user._id,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    },
  }
})
