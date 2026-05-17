import { connectDB } from '~~/server/utils/db'
import { Hospital } from '~~/server/models/Hospital'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await connectDB()

  const payload = requireAuth(event)
  if (payload.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Admin only' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const body = await readBody<{ name?: string; address?: string; phone?: string }>(event)

  const updated = await Hospital.findByIdAndUpdate(id, body, { new: true })
  if (!updated) throw createError({ statusCode: 404, statusMessage: 'Hospital not found' })

  return { success: true, data: updated }
})
