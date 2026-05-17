import { connectDB } from '~~/server/utils/db'
import { User } from '~~/server/models/User'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await connectDB()

  const payload = requireAuth(event)

  const user = await User.findById(payload.sub)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'User not found' })
  }

  return {
    success: true,
    data: {
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
