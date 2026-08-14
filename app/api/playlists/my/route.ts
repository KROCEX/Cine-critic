import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Playlist from '@/models/Playlist'
import { getCurrentUserId } from '@/lib/get-current-user'
import { serializePlaylist } from '@/lib/playlist-serialize'

export async function GET() {
  try {
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    await connectDB()

    const playlists = await Playlist.find({ userId })
      .sort({ createdAt: -1 })
      .lean()

    return NextResponse.json({
      success: true,
      data: playlists.map(serializePlaylist),
    })
  } catch (error) {
    console.error('获取我的片单失败:', error)
    return NextResponse.json({ success: false, error: '获取片单失败' }, { status: 500 })
  }
}
