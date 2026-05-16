import mongoose, { Schema } from 'mongoose'

const hospitalSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    address: { type: String, default: '' },
  },
  { timestamps: true }
)

export const Hospital = mongoose.models.Hospital || mongoose.model('Hospital', hospitalSchema)
