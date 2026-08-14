import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import Movie from '@/models/Movie'
import { calculateBayesianRating, type PlatformRating } from '@/bayesian-rating'

/** 支持的评分平台 */
const VALID_PLATFORMS = ['douban', 'imdb', 'metacritic', 'rotten_tomatoes', 'letterboxd']

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const body = await request.json()
    const { platform, score } = body

    // 参数校验
    if (!platform || typeof platform !== 'string') {
      return NextResponse.json(
        { success: false, error: '请提供评分平台名称 (platform)' },
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
        { success: false, error: '评分 (score) 必须是 0-10 之间的数字' },
        { status: 400 }
      )
    }

    await connectDB()

    const movie = await Movie.findById(id)
    if (!movie) {
      return NextResponse.json(
        { success: false, error: '电影不存在' },
        { status: 404 }
      )
    }

    // 若该平台已有评分则更新，否则添加
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
        platformRatings: movie.platformRatings,
        bayesianRating: result.score,
        ratingCount: result.count,
      },
    })
  } catch (error) {
    console.error('录入评分失败:', error)
    return NextResponse.json(
      { success: false, error: '录入评分失败' },
      { status: 500 }
    )
  }
}
