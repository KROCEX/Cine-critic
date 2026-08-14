import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/db'
import Movie from '@/models/Movie'
import { calculateBayesianRating, type PlatformRating } from '@/bayesian-rating'

const VALID_PLATFORMS = ['douban', 'imdb', 'metacritic', 'rottentomatoes']

export async function POST(request: Request) {
  try {
    // 权限校验：仅 admin
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: '无权限，仅管理员可操作' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { tmdbId, platform, score } = body

    // 参数校验
    if (!tmdbId || typeof tmdbId !== 'number') {
      return NextResponse.json(
        { success: false, error: '请提供有效的 TMDB ID' },
        { status: 400 }
      )
    }

    if (!VALID_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        {
          success: false,
          error: `不支持的平台，有效值: ${VALID_PLATFORMS.join(', ')}`,
        },
        { status: 400 }
      )
    }

    if (typeof score !== 'number' || score < 0 || score > 10) {
      return NextResponse.json(
        { success: false, error: '评分必须是 0-10 之间的数字' },
        { status: 400 }
      )
    }

    await connectDB()

    const movie = await Movie.findOne({ tmdbId })
    if (!movie) {
      return NextResponse.json(
        { success: false, error: `未找到 TMDB ID 为 ${tmdbId} 的电影，请先在首页加载` },
        { status: 404 }
      )
    }

    // 更新或新增评分
    const existingIndex = movie.platformRatings.findIndex(
      (r: { platform: string }) => r.platform === platform
    )

    if (existingIndex >= 0) {
      movie.platformRatings[existingIndex].score = score
    } else {
      movie.platformRatings.push({ platform, score })
    }

    await movie.save()

    const result = calculateBayesianRating(movie.platformRatings as PlatformRating[])

    return NextResponse.json({
      success: true,
      data: {
        _id: movie._id.toString(),
        tmdbId: movie.tmdbId,
        title: movie.title,
        posterPath: movie.posterPath,
        platformRatings: movie.platformRatings,
        bayesianRating: result.score,
        ratingCount: result.count,
      },
    })
  } catch (error) {
    console.error('管理员录入评分失败:', error)
    return NextResponse.json(
      { success: false, error: '录入评分失败' },
      { status: 500 }
    )
  }
}
