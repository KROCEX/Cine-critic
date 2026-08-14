import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Playlist from '@/models/Playlist'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params

    await connectDB()

    const playlist = await Playlist.findByIdAndUpdate(
      id,
      { $inc: { likes: 1 } },
      { new: true }
    )
    if (!playlist) {
      return NextResponse.json({ success: false, error: '片单不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true, likes: playlist.likes })
  } catch (error) {
    console.error('收藏片单失败:', error)
    return NextResponse.json({ success: false, error: '收藏片单失败' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    await connectDB()

    // 仅当 likes > 0 时才递减，避免出现负数
    const playlist = await Playlist.findOneAndUpdate(
      { _id: id, likes: { $gt: 0 } },
      { $inc: { likes: -1 } },
      { new: true }
    )

    const current = playlist ?? (await Playlist.findById(id))
    if (!current) {
      return NextResponse.json({ success: false, error: '片单不存在' }, { status: 404 })
    }

    return NextResponse.json({ success: true, likes: current.likes })
  } catch (error) {
    console.error('取消收藏片单失败:', error)
    return NextResponse.json({ success: false, error: '取消收藏片单失败' }, { status: 500 })
  }
}
