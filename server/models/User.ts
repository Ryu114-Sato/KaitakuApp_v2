import mongoose, { Schema, type Document } from 'mongoose'

export interface IUser extends Document {
  role: 'sw' | 'taxi' | 'admin'
  email: string
  passwordHash: string
  name: string
  phone?: string
  serviceArea?: string
  vehicles?: string[]
  createdAt: Date
  updatedAt: Date
}

const userSchema = new Schema<IUser>(
  {
    role: { type: String, enum: ['sw', 'taxi', 'admin'], required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    name: { type: String, required: true, default: '' },
    phone: { type: String, default: '' },
    serviceArea: { type: String, default: '' },
    vehicles: { type: [String], default: [] },
  },
  { timestamps: true }
)

export const User = (mongoose.models.User as mongoose.Model<IUser>) || mongoose.model<IUser>('User', userSchema)
