import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Playlist from '@/models/Playlist'
// 副作用导入：注册 User 模型供 populate 使用（避免 tree-shaking 移除）
import '@/models/User'
import { serializePlaylist } from '@/lib/playlist-serialize'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    await connectDB()

    const [docs, total] = await Promise.all([
      Playlist.find({ isPublic: true })
        .sort({ likes: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('userId', 'name email')
        .lean(),
      Playlist.countDocuments({ isPublic: true }),
    ])

    const data = docs.map((doc) => {
      const creator = doc.userId as unknown as { _id: string; name?: string; email?: string } | null
      return {
        ...serializePlaylist(doc),
        creator: creator
          ? {
              id: String(creator._id),
              name: creator.name ?? creator.email ?? '匿名用户',
            }
          : null,
      }
    })

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('获取片单广场失败:', error)
    return NextResponse.json({ success: false, error: '获取片单广场失败' }, { status: 500 })
  }
}
