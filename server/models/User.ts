import mongoose, { Schema } from 'mongoose'

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['sw', 'taxi'], required: true },
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
  },
  { timestamps: true }
)

export const User = mongoose.models.User || mongoose.model('User', userSchema)
