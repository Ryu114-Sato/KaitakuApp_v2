import bcrypt from 'bcryptjs'
import { connectDB } from '~~/server/utils/db'
import { User } from '~~/server/models/User'

export default defineEventHandler(async (event) => {
  await connectDB()
  const { email, password, role } = await readBody<{
    email: string
    password: string
    role: 'sw' | 'taxi'
  }>(event)

  if (!email || !password || !role) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const existing = await User.findOne({ email })
  if (existing) throw createError({ statusCode: 409, statusMessage: 'Email already registered' })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await User.create({ email, passwordHash, role })

  return { id: user._id, email: user.email, role: user.role }
})
