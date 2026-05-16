import mongoose from 'mongoose'

let isConnected = false

export async function connectDB() {
  if (isConnected) return

  const uri = useRuntimeConfig().mongodbUri
  if (!uri) throw createError({ statusCode: 500, statusMessage: 'MONGODB_URI is not configured' })

  await mongoose.connect(uri)
  isConnected = true
  console.log('MongoDB connected')
}
