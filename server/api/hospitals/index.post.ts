import { connectDB } from '~~/server/utils/db'
import { Hospital } from '~~/server/models/Hospital'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await connectDB()

  const payload = requireAuth(event)
  if (payload.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })
  }

  const body = await readBody<{ name: string; address?: string; phone?: string }>(event)

  if (!body.name) throw createError({ statusCode: 400, statusMessage: 'name is required' })

  const existing = await Hospital.findOne({ name: body.name })
  if (existing) throw createError({ statusCode: 409, statusMessage: 'この病院名は既に登録されています' })

  const hospital = await Hospital.create({
    name: body.name,
    address: body.address ?? '',
    phone: body.phone ?? '',
    source: 'manual',
  })

  return { success: true, data: hospital }
})
