import { NextResponse } from 'next/server'
import { fetchMovieById } from '@/lib/tmdb'
import { connectDB } from '@/lib/db'
import Movie from '@/models/Movie'
import { calculateBayesianRating, type PlatformRating } from '@/bayesian-rating'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const tmdbId = parseInt(searchParams.get('tmdbId') || '')

    if (!tmdbId) {
      return NextResponse.json(
        { success: false, error: '请提供 tmdbId 参数' },
        { status: 400 }
      )
    }

    const [tmdbMovie, dbMovie] = await Promise.all([
      fetchMovieById(tmdbId),
      (async () => {
        await connectDB()
        return Movie.findOne({ tmdbId }).lean()
      })(),
    ])

    if (!tmdbMovie) {
      return NextResponse.json(
        { success: false, error: 'TMDB 未找到该电影' },
        { status: 404 }
      )
    }

    const ratings = (dbMovie?.platformRatings || []) as PlatformRating[]
    const bayesianResult = calculateBayesianRating(ratings)

    return NextResponse.json({
      success: true,
      data: {
        tmdbId: tmdbMovie.id,
        title: tmdbMovie.title,
        originalTitle: tmdbMovie.original_title,
        overview: tmdbMovie.overview,
        posterPath: tmdbMovie.poster_path,
        backdropPath: tmdbMovie.backdrop_path,
        releaseDate: tmdbMovie.release_date,
        runtime: tmdbMovie.runtime,
        genres: tmdbMovie.genres.map((g) => g.name),
        tmdbVoteAverage: tmdbMovie.vote_average,
        tmdbVoteCount: tmdbMovie.vote_count,
        tagline: tmdbMovie.tagline,
        status: tmdbMovie.status,
        platformRatings: ratings,
        bayesianRating: bayesianResult.score,
        ratingCount: bayesianResult.count,
      },
    })
  } catch (error) {
    console.error('获取电影详情失败:', error)
    return NextResponse.json(
      { success: false, error: '获取电影详情失败' },
      { status: 500 }
    )
  }
}
