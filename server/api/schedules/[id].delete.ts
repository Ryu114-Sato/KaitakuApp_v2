import { connectDB } from '~~/server/utils/db'
import { Schedule } from '~~/server/models/Schedule'

export default defineEventHandler(async (event) => {
  await connectDB()
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  await Schedule.findByIdAndDelete(id)
  return { ok: true }
})
