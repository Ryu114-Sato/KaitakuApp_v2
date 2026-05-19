import { connectDB } from '~~/server/utils/db'
import { Schedule } from '~~/server/models/Schedule'
import { requireAuth } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await connectDB()

  const payload = requireAuth(event)
  const q = getQuery(event)

  // 事業者：自分のスケジュール一覧
  if (payload.role === 'taxi') {
    const items = await Schedule.find({ taxiUserId: payload.sub })
      .sort({ arrivalDateTime: 1 })
    return { success: true, data: items }
  }

  // SW：検索（hospitalName必須）
  if (payload.role === 'sw') {
    if (!q.hospitalName) {
      throw createError({ statusCode: 400, statusMessage: 'hospitalName is required' })
    }

    const filter: Record<string, any> = {
      hospitalName: String(q.hospitalName),
      status: { $ne: 'cancelled' },
    }

    if (q.datetime) {
      // 日時指定あり → 前後1時間以内
      const dt = new Date(String(q.datetime))
      filter.arrivalDateTime = {
        $gte: new Date(dt.getTime() - 60 * 60 * 1000),
        $lte: new Date(dt.getTime() + 60 * 60 * 1000),
      }
    } else {
      // 日時指定なし → 本日 JST 0:00 以降（過去スケジュールを除外）
      const jstOffset = 9 * 60 * 60 * 1000
      const nowJST    = Date.now() + jstOffset
      const midnightJST = nowJST - (nowJST % (24 * 60 * 60 * 1000))   // JST 0:00 の UTC ms
      filter.arrivalDateTime = { $gte: new Date(midnightJST - jstOffset) }
    }

    // 車両条件
    if (q.vehicles) {
      const vehicleList = String(q.vehicles).split(',').filter(Boolean)
      if (vehicleList.length > 0) {
        filter.vehicles = { $in: vehicleList }
      }
    }

    const items = await Schedule.find(filter).sort({ arrivalDateTime: 1 })
    return { success: true, data: items }
  }

  throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
})
