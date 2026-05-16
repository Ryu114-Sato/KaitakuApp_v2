import { connectDB } from '~~/server/utils/db'
import { User } from '~~/server/models/User'

export default defineEventHandler(async (event) => {
  await connectDB()
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  const body = await readBody<{ name?: string; phone?: string }>(event)
  const updated = await User.findByIdAndUpdate(id, body, { new: true }).select('-passwordHash')
  return updated
})
