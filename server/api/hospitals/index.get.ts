import { connectDB } from '~~/server/utils/db'
import { Hospital } from '~~/server/models/Hospital'

export default defineEventHandler(async (event) => {
  await connectDB()
  const q = getQuery(event)
  const filter: Record<string, any> = {}
  if (q.q) {
    // 前方一致・大小文字無視（^ アンカーで入力文字から始まる名前に絞る）
    const escaped = String(q.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    filter.name = { $regex: `^${escaped}`, $options: 'i' }
  }

  const hospitals = await Hospital
    .find(filter)
    .limit(10)
    .sort({ name: 1 })
    .select('name address phone')

  return { success: true, data: hospitals }
})
