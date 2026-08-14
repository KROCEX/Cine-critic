import { NextResponse } from 'next/server'
import { fetchMoviesByIds } from '@/lib/tmdb'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const idsParam = searchParams.get('ids') || ''
    const ids = idsParam
      .split(',')
      .map((s) => parseInt(s.trim()))
      .filter((n) => Number.isFinite(n) && n > 0)
      .slice(0, 30)

    if (ids.length === 0) {
      return NextResponse.json({ success: false, error: '请提供有效的电影 ID 列表' }, { status: 400 })
    }

    const movies = await fetchMoviesByIds(ids)
    return NextResponse.json({ success: true, data: movies })
  } catch (error) {
    console.error('批量获取电影失败:', error)
    return NextResponse.json({ success: false, error: '获取电影失败' }, { status: 500 })
  }
}
