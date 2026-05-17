import mongoose, { Schema, type Document } from 'mongoose'

export interface IHospital extends Document {
  name: string
  address: string
  phone: string
  source: 'medical_code' | 'manual'
  externalCode?: string
  createdAt: Date
  updatedAt: Date
}

const hospitalSchema = new Schema<IHospital>(
  {
    name: { type: String, required: true, unique: true, index: true },
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    source: { type: String, enum: ['medical_code', 'manual'], required: true, default: 'manual' },
    externalCode: { type: String, default: '' },
  },
  { timestamps: true }
)

export const Hospital = (mongoose.models.Hospital as mongoose.Model<IHospital>)
  || mongoose.model<IHospital>('Hospital', hospitalSchema)
