import mongoose, { Schema, type Document, type Types } from 'mongoose'

export interface ISchedule extends Document {
  taxiUserId: Types.ObjectId
  taxiName: string
  taxiPhone: string
  hospitalId?: Types.ObjectId
  hospitalName: string
  arrivalDateTime: Date
  type: 'consultation' | 'discharge' | 'transfer'
  vehicles: string[]
  status: 'confirmed' | 'tentative' | 'cancelled'
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const scheduleSchema = new Schema<ISchedule>(
  {
    taxiUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    taxiName: { type: String, required: true },
    taxiPhone: { type: String, required: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', default: null },
    hospitalName: { type: String, required: true, index: true },
    arrivalDateTime: { type: Date, required: true, index: true },
    type: { type: String, enum: ['consultation', 'discharge', 'transfer'], required: true },
    vehicles: { type: [String], required: true },
    status: { type: String, enum: ['confirmed', 'tentative', 'cancelled'], required: true, default: 'tentative' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
)

// 検索用複合インデックス（病院名×日時×ステータス）
scheduleSchema.index({ hospitalName: 1, arrivalDateTime: 1, status: 1 })

export const Schedule = (mongoose.models.Schedule as mongoose.Model<ISchedule>)
  || mongoose.model<ISchedule>('Schedule', scheduleSchema)
