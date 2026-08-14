import { NextResponse } from 'next/server'
import axios from 'axios'
import { connectDB } from '@/lib/db'
import Movie from '@/models/Movie'
import { calculateBayesianRatingBatch, type PlatformRating } from '@/bayesian-rating'

interface TMDBMovie {
  id: number
  title: string
  poster_path: string | null
  release_date: string
}

export async function GET() {
  try {
    const apiKey = process.env.TMDB_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'TMDB_API_KEY 未配置' },
        { status: 500 }
      )
    }

    const { data } = await axios.get<{ results: TMDBMovie[] }>(
      'https://api.tmdb.org/3/movie/popular',
      {
        params: { api_key: apiKey, language: 'zh-CN', page: 1 },
      }
    )

    const movies = data.results.slice(0, 10)

    await connectDB()

    const bulkOps = movies.map((movie) => ({
      updateOne: {
        filter: { tmdbId: movie.id },
        update: {
          $setOnInsert: {
            tmdbId: movie.id,
            title: movie.title,
            posterPath: movie.poster_path,
            releaseDate: movie.release_date,
            platformRatings: [],
          },
        },
        upsert: true,
      },
    }))

    if (bulkOps.length > 0) {
      await Movie.bulkWrite(bulkOps)
    }

    const docs = await Movie.find({}).sort({ tmdbId: -1 }).lean()

    const enriched = calculateBayesianRatingBatch(
      docs.map((doc) => ({
        _id: (doc._id as unknown as string).toString(),
        tmdbId: doc.tmdbId,
        title: doc.title,
        posterPath: doc.posterPath,
        releaseDate: doc.releaseDate,
        platformRatings: (doc.platformRatings || []) as PlatformRating[],
      }))
    )

    return NextResponse.json({ success: true, data: enriched })
  } catch (error) {
    console.error('获取热门电影失败:', error)
    return NextResponse.json(
      { success: false, error: '获取热门电影数据失败' },
      { status: 500 }
    )
  }
}
