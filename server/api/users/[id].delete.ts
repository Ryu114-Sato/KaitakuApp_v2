import { connectDB } from '~~/server/utils/db'
import { User } from '~~/server/models/User'
import { requireAuth, clearAuthCookie } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await connectDB()

  const payload = requireAuth(event)
  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'id required' })

  if (payload.sub !== id) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  await User.findByIdAndDelete(id)
  clearAuthCookie(event)

  return { success: true }
})
