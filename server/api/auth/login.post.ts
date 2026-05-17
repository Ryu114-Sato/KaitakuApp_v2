import bcrypt from 'bcryptjs'
import { connectDB } from '~~/server/utils/db'
import { User } from '~~/server/models/User'
import { signToken, setAuthCookie } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await connectDB()

  const body = await readBody<{ email: string; password: string }>(event)

  if (!body.email || !body.password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing email or password' })
  }

  // passwordHash は select: false なので明示的に +passwordHash
  const user = await User.findOne({ email: body.email.toLowerCase() }).select('+passwordHash')
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'メールアドレスまたはパスワードが正しくありません' })
  }

  const ok = await bcrypt.compare(body.password, user.passwordHash)
  if (!ok) {
    throw createError({ statusCode: 401, statusMessage: 'メールアドレスまたはパスワードが正しくありません' })
  }

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
        serviceArea: user.serviceArea,
        vehicles: user.vehicles,
      },
    },
  }
})
