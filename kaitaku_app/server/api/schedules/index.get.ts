import { connectDB } from '~~/server/utils/db'
import { Schedule } from '~~/server/models/Schedule'

export default defineEventHandler(async (event) => {
  await connectDB()
  const q = getQuery(event)

  const filter: Record<string, any> = {}
  if (q.hospital) filter.hospital = q.hospital
  if (q.vehicle) filter.vehicle = q.vehicle
  if (q.from || q.to) {
    filter.arrivalAt = {}
    if (q.from) filter.arrivalAt.$gte = new Date(String(q.from))
    if (q.to) filter.arrivalAt.$lte = new Date(String(q.to))
  }

  return await Schedule.find(filter).populate('taxiUserId', 'name phone').sort({ arrivalAt: 1 })
})
