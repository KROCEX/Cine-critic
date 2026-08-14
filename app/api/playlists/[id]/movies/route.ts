import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Playlist from '@/models/Playlist'
import { getCurrentUserId } from '@/lib/get-current-user'
import { fetchMovieById } from '@/lib/tmdb'
import { serializePlaylist } from '@/lib/playlist-serialize'

type Params = { params: Promise<{ id: string }> }

export async function POST(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { tmdbId } = body

    if (typeof tmdbId !== 'number' || !Number.isFinite(tmdbId) || tmdbId <= 0) {
      return NextResponse.json({ success: false, error: '请提供有效的 TMDB ID' }, { status: 400 })
    }

    await connectDB()

    const playlist = await Playlist.findById(id)
    if (!playlist) {
      return NextResponse.json({ success: false, error: '片单不存在' }, { status: 404 })
    }
    if (String(playlist.userId) !== userId) {
      return NextResponse.json({ success: false, error: '无权限修改该片单' }, { status: 403 })
    }

    // 验证 TMDB ID 有效
    const tmdbMovie = await fetchMovieById(tmdbId)
    if (!tmdbMovie) {
      return NextResponse.json({ success: false, error: 'TMDB 中不存在该电影' }, { status: 404 })
    }

    // 避免重复
    if (!playlist.movies.includes(tmdbId)) {
      playlist.movies.push(tmdbId)
      await playlist.save()
    }

    return NextResponse.json({
      success: true,
      data: {
        ...serializePlaylist(playlist),
        addedMovie: { tmdbId, title: tmdbMovie.title },
      },
    })
  } catch (error) {
    console.error('添加电影失败:', error)
    return NextResponse.json({ success: false, error: '添加电影失败' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const userId = await getCurrentUserId()
    if (!userId) {
      return NextResponse.json({ success: false, error: '请先登录' }, { status: 401 })
    }

    const body = await request.json()
    const { tmdbId } = body

    if (typeof tmdbId !== 'number' || tmdbId <= 0) {
      return NextResponse.json({ success: false, error: '请提供有效的 TMDB ID' }, { status: 400 })
    }

    await connectDB()

    const playlist = await Playlist.findById(id)
    if (!playlist) {
      return NextResponse.json({ success: false, error: '片单不存在' }, { status: 404 })
    }
    if (String(playlist.userId) !== userId) {
      return NextResponse.json({ success: false, error: '无权限修改该片单' }, { status: 403 })
    }

    playlist.movies = playlist.movies.filter((m: number) => m !== tmdbId)
    await playlist.save()

    return NextResponse.json({ success: true, data: serializePlaylist(playlist) })
  } catch (error) {
    console.error('移除电影失败:', error)
    return NextResponse.json({ success: false, error: '移除电影失败' }, { status: 500 })
  }
}
