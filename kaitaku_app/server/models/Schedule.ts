import mongoose, { Schema } from 'mongoose'

const scheduleSchema = new Schema(
  {
    taxiUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    hospital: { type: String, required: true, index: true },
    arrivalAt: { type: Date, required: true, index: true },
    type: { type: String, enum: ['受診', '退院', '転院'], required: true },
    vehicle: { type: String, enum: ['車椅子', 'ストレッチャー'], required: true },
    status: { type: String, enum: ['確定', '仮', 'キャンセル'], required: true, default: '仮' },
  },
  { timestamps: true }
)

export const Schedule = mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema)
