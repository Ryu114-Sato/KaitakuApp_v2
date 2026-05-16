import { connectDB } from '~~/server/utils/db'
import { Schedule } from '~~/server/models/Schedule'

export default defineEventHandler(async (event) => {
  await connectDB()
  const body = await readBody(event)

  // TODO: JWTからtaxiUserIdを取得して付与する
  const created = await Schedule.create(body)
  return created
})
