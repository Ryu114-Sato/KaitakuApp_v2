import { connectDB } from '~~/server/utils/db'
import { Schedule } from '~~/server/models/Schedule'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await connectDB()

  const payload = requireAuth(event)
  if (payload.role !== 'taxi') {
    throw createError({ statusCode: 403, statusMessage: 'Taxi operators only' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const existing = await Schedule.findById(id)
  if (!existing) throw createError({ statusCode: 404, statusMessage: 'Schedule not found' })

  // 自分のスケジュールのみ削除可
  if (existing.taxiUserId.toString() !== payload.sub) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  await Schedule.findByIdAndDelete(id)
  return { success: true }
})
