import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Playlist from '@/models/Playlist'
import User from '@/models/User'
import { getCurrentUserId } from '@/lib/get-current-user'
import { serializePlaylist } from '@/lib/playlist-serialize'

type Params = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const currentUserId = await getCurrentUserId()

    await connectDB()

    const playlist = await Playlist.findById(id).lean()
    if (!playlist) {
      return NextResponse.json({ success: false, error: '片单不存在' }, { status: 404 })
    }

    // 私有片单仅创建者可查看
    if (!playlist.isPublic && String(playlist.userId) !== currentUserId) {
      return NextResponse.json({ success: false, error: '该片单为私密片单' }, { status: 403 })
    }

    const creator = await User.findById(playlist.userId).select('name email').lean()

    return NextResponse.json({
      success: true,
      data: {
        ...serializePlaylist(playlist),
        creator: creator
          ? { id: String(creator._id), name: creator.name ?? creator.email ?? '匿名用户' }
          : null,
        isOwner: currentUserId === String(playlist.userId),
      },
    })
  } catch (error) {
    console.error('获取片单详情失败:', error)
    return NextResponse.json({ success: false, error: '获取片单详情失败' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, tags, isPublic } = body

    if (title != null) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        return NextResponse.json({ success: false, error: '片单标题不能为空' }, { status: 400 })
      }
      if (title.trim().length > 30) {
        return NextResponse.json({ success: false, error: '标题最多 30 个字符' }, { status: 400 })
      }
    }
    if (description != null && (typeof description !== 'string' || description.length > 100)) {
      return NextResponse.json({ success: false, error: '描述最多 100 个字符' }, { status: 400 })
    }

    await connectDB()

    const playlist = await Playlist.findById(id)
    if (!playlist) {
      return NextResponse.json({ success: false, error: '片单不存在' }, { status: 404 })
    }

    if (String(playlist.userId) !== userId) {
      return NextResponse.json({ success: false, error: '无权限修改该片单' }, { status: 403 })
    }

    // 公开片单不可改回私密
    if (isPublic != null && playlist.isPublic === true && isPublic === false) {
      return NextResponse.json(
        { success: false, error: '公开片单不可改回私密' },
        { status: 400 }
      )
    }

    if (title != null) playlist.title = title.trim()
    if (description != null) playlist.description = description.trim()
    if (tags != null) {
      if (!Array.isArray(tags) || tags.some((t) => typeof t !== 'string')) {
        return NextResponse.json({ success: false, error: '标签格式不正确' }, { status: 400 })
      }
      playlist.tags = [...new Set(tags.map((t) => t.trim()).filter((t) => t.length > 0))].slice(0, 10)
    }
    if (isPublic != null) playlist.isPublic = Boolean(isPublic)

    await playlist.save()

    return NextResponse.json({ success: true, data: serializePlaylist(playlist) })
  } catch (error) {
    console.error('更新片单失败:', error)
    return NextResponse.json({ success: false, error: '更新片单失败' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    await connectDB()

    const playlist = await Playlist.findById(id)
    if (!playlist) {
      return NextResponse.json({ success: false, error: '片单不存在' }, { status: 404 })
    }

    if (String(playlist.userId) !== userId) {
      return NextResponse.json({ success: false, error: '无权限删除该片单' }, { status: 403 })
    }

    await playlist.deleteOne()

    return NextResponse.json({ success: true, message: '片单已删除' })
  } catch (error) {
    console.error('删除片单失败:', error)
    return NextResponse.json({ success: false, error: '删除片单失败' }, { status: 500 })
  }
}
