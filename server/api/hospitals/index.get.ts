import { connectDB } from '~~/server/utils/db'
import { Hospital } from '~~/server/models/Hospital'

export default defineEventHandler(async (event) => {
  await connectDB()
  const q = getQuery(event)
  const filter: Record<string, any> = {}
  if (q.q) filter.name = { $regex: String(q.q), $options: 'i' }

  return await Hospital.find(filter).limit(20).sort({ name: 1 })
})
