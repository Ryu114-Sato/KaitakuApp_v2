import bcrypt from 'bcryptjs'
import { connectDB } from '~~/server/utils/db'
import { User } from '~~/server/models/User'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await connectDB()

  const payload = requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  // 自分のプロフィールのみ更新可
  if (payload.sub !== id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody<{
    name?: string
    email?: string
    phone?: string
    serviceArea?: string
    vehicles?: string[]
    password?: string
  }>(event)

  const update: Record<string, any> = {}
  if (body.name !== undefined) update.name = body.name
  if (body.email !== undefined) update.email = body.email
  if (body.phone !== undefined) update.phone = body.phone
  if (body.serviceArea !== undefined) update.serviceArea = body.serviceArea
  if (body.vehicles !== undefined) update.vehicles = body.vehicles
  if (body.password) {
    if (body.password.length < 8) {
      throw createError({ statusCode: 400, statusMessage: 'Password must be at least 8 characters' })
    }
    update.passwordHash = await bcrypt.hash(body.password, 12)
  }

  const updated = await User.findByIdAndUpdate(id, update, { new: true })
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  return {
    success: true,
    data: {
      id: updated._id,
      role: updated.role,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      serviceArea: updated.serviceArea,
      vehicles: updated.vehicles,
    },
  }
})
