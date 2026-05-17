import { connectDB } from '~~/server/utils/db'
import { Schedule } from '~~/server/models/Schedule'
import { User } from '~~/server/models/User'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await connectDB()

  const payload = requireAuth(event)
  if (payload.role !== 'taxi') {
    throw createError({ statusCode: 403, statusMessage: 'Taxi operators only' })
  }

  const user = await User.findById(payload.sub)
  if (!user) throw createError({ statusCode: 401, statusMessage: 'User not found' })

  const body = await readBody<{
    hospitalName: string
    arrivalDateTime: string
    type: 'consultation' | 'discharge' | 'transfer'
    vehicles: string[]
    status: 'confirmed' | 'tentative' | 'cancelled'
    notes?: string
  }>(event)

  if (!body.hospitalName || !body.arrivalDateTime || !body.type || !body.vehicles?.length || !body.status) {
    throw createError({ statusCode: 400, statusMessage: 'Missing required fields' })
  }

  const schedule = await Schedule.create({
    taxiUserId: user._id,
    taxiName: user.name,
    taxiPhone: user.phone ?? '',
    hospitalName: body.hospitalName,
    arrivalDateTime: new Date(body.arrivalDateTime),
    type: body.type,
    vehicles: body.vehicles,
    status: body.status,
    notes: body.notes ?? '',
  })

  return { success: true, data: schedule }
})
