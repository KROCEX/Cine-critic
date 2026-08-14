import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Playlist from '@/models/Playlist'
import { getCurrentUserId } from '@/lib/get-current-user'
import { serializePlaylist } from '@/lib/playlist-serialize'

export async function POST(request: Request) {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, tags, isPublic } = body

    // 校验 title
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ success: false, error: '片单标题不能为空' }, { status: 400 })
    }
    if (title.trim().length > 30) {
      return NextResponse.json({ success: false, error: '标题最多 30 个字符' }, { status: 400 })
    }

    // 校验 description
    if (description != null && (typeof description !== 'string' || description.length > 100)) {
      return NextResponse.json({ success: false, error: '描述最多 100 个字符' }, { status: 400 })
    }

    // 校验 tags
    let normalizedTags: string[] = []
    if (tags != null) {
      if (!Array.isArray(tags) || tags.some((t) => typeof t !== 'string')) {
        return NextResponse.json({ success: false, error: '标签格式不正确' }, { status: 400 })
      }
      normalizedTags = [...new Set(tags.map((t) => t.trim()).filter((t) => t.length > 0))].slice(0, 10)
    }

    await connectDB()

    const playlist = await Playlist.create({
      userId,
      title: title.trim(),
      description: (description ?? '').trim(),
      tags: normalizedTags,
      isPublic: isPublic !== false,
      movies: [],
      likes: 0,
    })

    return NextResponse.json(
      { success: true, data: serializePlaylist(playlist) },
      { status: 201 }
    )
  } catch (error) {
    console.error('创建片单失败:', error)
    return NextResponse.json({ success: false, error: '创建片单失败' }, { status: 500 })
  }
}
