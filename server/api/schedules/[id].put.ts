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

  // 自分のスケジュールのみ更新可
  if (existing.taxiUserId.toString() !== payload.sub) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody<{
    hospitalName?: string
    arrivalDateTime?: string
    type?: 'consultation' | 'discharge' | 'transfer'
    vehicles?: string[]
    status?: 'confirmed' | 'tentative' | 'cancelled'
    notes?: string
  }>(event)

  const update: Record<string, any> = {}
  if (body.hospitalName !== undefined) update.hospitalName = body.hospitalName
  if (body.arrivalDateTime !== undefined) update.arrivalDateTime = new Date(body.arrivalDateTime)
  if (body.type !== undefined) update.type = body.type
  if (body.vehicles !== undefined) update.vehicles = body.vehicles
  if (body.status !== undefined) update.status = body.status
  if (body.notes !== undefined) update.notes = body.notes

  const updated = await Schedule.findByIdAndUpdate(id, update, { new: true })
  return { success: true, data: updated }
})
