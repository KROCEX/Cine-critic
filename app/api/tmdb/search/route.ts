import { NextResponse } from 'next/server'
import { searchMovies } from '@/lib/tmdb'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query')?.trim()

    if (!query) {
      return NextResponse.json({ success: false, error: '请提供搜索关键词' }, { status: 400 })
    }

    const results = await searchMovies(query)
    return NextResponse.json({ success: true, data: results })
  } catch (error) {
    console.error('搜索电影失败:', error)
    return NextResponse.json({ success: false, error: '搜索电影失败' }, { status: 500 })
  }
}
