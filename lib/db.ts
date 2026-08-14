import mongoose from 'mongoose'
import dns from 'dns'

const MONGODB_URI = process.env.MONGODB_URI!

if (!MONGODB_URI) {
  throw new Error('请在 .env.local 中定义 MONGODB_URI')
}

/**
 * 部分网络环境下系统 DNS 服务器无法解析 MongoDB Atlas 的 SRV 记录
 * （报错 querySrv ECONNREFUSED），这里强制切换到公共 DNS 以确保连接稳定。
 */
let dnsConfigured = false
function ensureDnsResolvable() {
  if (!dnsConfigured) {
    dns.setServers(['8.8.8.8', '1.1.1.1'])
    dnsConfigured = true
  }
}

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

const globalWithMongoose = global as typeof globalThis & {
  mongoose?: MongooseCache
}

if (!globalWithMongoose.mongoose) {
  globalWithMongoose.mongoose = { conn: null, promise: null }
}

const cached = globalWithMongoose.mongoose

export async function connectDB() {
  ensureDnsResolvable()

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      connectTimeoutMS: 30000, // 30秒连接超时
      socketTimeoutMS: 30000, // 30秒 Socket 超时
    }
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => m)
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    // 连接失败时清空 promise，允许下次重试
    cached.promise = null
    console.error('MongoDB 连接失败:', err instanceof Error ? err.message : err)
    throw err
  }

  return cached.conn
}
