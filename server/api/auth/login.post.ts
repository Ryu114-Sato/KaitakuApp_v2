import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { connectDB } from '~~/server/utils/db'
import { User } from '~~/server/models/User'

export default defineEventHandler(async (event) => {
  await connectDB()
  const { email, password } = await readBody<{ email: string; password: string }>(event)

  const user = await User.findOne({ email })
  if (!user) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.passwordHash)
  if (!ok) throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' })

  const token = jwt.sign(
    { sub: user._id.toString(), role: user.role },
    useRuntimeConfig().jwtSecret,
    { expiresIn: '7d' }
  )

  return {
    token,
    user: { id: user._id, email: user.email, role: user.role },
  }
})
