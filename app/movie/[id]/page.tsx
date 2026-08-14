'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { Star, Users, Loader2, Film, Calendar, Clock, Tag } from 'lucide-react'

interface MovieDetail {
  tmdbId: number
  title: string
  originalTitle: string
  overview: string
  posterPath: string | null
  backdropPath: string | null
  releaseDate: string
  runtime: number
  genres: string[]
  tmdbVoteAverage: number
  tmdbVoteCount: number
  tagline: string
  status: string
  platformRatings: { platform: string; score: number }[]
  bayesianRating: number | null
  ratingCount: number
}

const PLATFORM_LABELS: Record<string, string> = {
  douban: '豆瓣',
  imdb: 'IMDb',
  metacritic: 'Metacritic',
  rottentomatoes: '烂番茄',
  letterboxd: 'Letterboxd',
}

function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function MovieDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [movie, setMovie] = useState<MovieDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    async function fetchDetail() {
      try {
        // 先从 MongoDB 获取 tmdbId
        const metaRes = await fetch(`/api/movies/popular`)
        const metaData = await metaRes.json()
        const found = metaData.data?.find(
          (m: { _id: string; tmdbId: number }) => m._id === id
        )

        let tmdbId = found?.tmdbId
        if (!tmdbId) {
          // 尝试直接作为 tmdbId 解析
          const parsed = parseInt(id)
          if (!isNaN(parsed)) tmdbId = parsed
        }

        if (!tmdbId) {
          if (isMounted) setError('未找到该电影')
          return
        }

        const res = await fetch(`/api/movie?tmdbId=${tmdbId}`)
        const data = await res.json()

        if (isMounted) {
          if (data.success) {
            setMovie(data.data)
          } else {
            setError(data.error || '获取电影详情失败')
          }
        }
      } catch {
        if (isMounted) setError('网络错误')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchDetail()

    return () => {
      isMounted = false
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-8 animate-spin text-yellow-400" />
      </div>
    )
  }

  if (error || !movie) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-red-400">{error || '未找到该电影'}</p>
      </div>
    )
  }

  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : 'https://via.placeholder.com/500x750/333333/FFFFFF?text=No+Poster'

  const backdropUrl = movie.backdropPath
    ? `https://image.tmdb.org/t/p/original${movie.backdropPath}`
    : null

  const releaseYear = movie.releaseDate ? movie.releaseDate.slice(0, 4) : ''

  return (
    <div className="mx-auto max-w-5xl">
      {/* 背景图 */}
      {backdropUrl && (
        <div className="relative h-64 w-full overflow-hidden sm:h-80">
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/30" />
        </div>
      )}

      <div className={`px-6 ${backdropUrl ? '-mt-32 relative z-10' : 'pt-10'}`}>
        {/* 基本信息区 */}
        <div className="flex flex-col gap-6 sm:flex-row">
          {/* 海报 */}
          <div className="mx-auto w-48 shrink-0 sm:mx-0 sm:w-56">
            <Image
              src={posterUrl}
              alt={`《${movie.title}》海报`}
              width={500}
              height={750}
              className="w-full rounded-xl shadow-2xl"
              unoptimized
            />
          </div>

          {/* 信息 */}
          <div className="flex flex-col gap-4 pt-4 sm:pt-8">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                {movie.title}
              </h1>
              {movie.originalTitle !== movie.title && (
                <p className="mt-1 text-sm text-gray-400">{movie.originalTitle}</p>
              )}
              {movie.tagline && (
                <p className="mt-1 text-sm italic text-gray-500">{movie.tagline}</p>
              )}
            </div>

            {/* 元信息 */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-400">
              {releaseYear && (
                <span className="flex items-center gap-1">
                  <Calendar className="size-4" />
                  {releaseYear}
                </span>
              )}
              {movie.runtime > 0 && (
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {formatRuntime(movie.runtime)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Film className="size-4" />
                {movie.genres.join(' / ')}
              </span>
            </div>

            {/* TMDB 评分 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">TMDB</span>
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-white">
                {movie.tmdbVoteAverage.toFixed(1)}
              </span>
              <span className="text-xs text-gray-500">
                ({movie.tmdbVoteCount.toLocaleString()} 票)
              </span>
            </div>

            {/* 简介 */}
            <div>
              <h3 className="mb-1 text-sm font-semibold text-gray-300">剧情简介</h3>
              <p className="text-sm leading-relaxed text-gray-400">
                {movie.overview || '暂无简介'}
              </p>
            </div>
          </div>
        </div>

        {/* 科学评分区 */}
        <div className="mt-10 border-t border-gray-800 pt-8">
          <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
            <Star className="size-5 fill-yellow-400 text-yellow-400" />
            科学评分
          </h2>

          {/* 贝叶斯评分 */}
          <div className="mb-6 flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900/50 p-6">
            <div className="flex size-20 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 text-2xl font-bold text-black shadow-lg">
              {movie.bayesianRating !== null ? movie.bayesianRating.toFixed(1) : '--'}
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                {movie.bayesianRating !== null
                  ? `贝叶斯加权评分 ${movie.bayesianRating.toFixed(1)}`
                  : '暂无评分数据'}
              </p>
              <p className="flex items-center gap-1 text-sm text-gray-400">
                <Users className="size-3" />
                {movie.ratingCount > 0
                  ? `基于 ${movie.ratingCount} 个平台的综合评分`
                  : '还未有任何平台录入评分'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                贝叶斯平均 = (v/(v+m)) × R + (m/(v+m)) × C，m=5, C=7.0
              </p>
            </div>
          </div>

          {/* 各平台评分列表 */}
          {movie.platformRatings.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {movie.platformRatings.map((r) => (
                <div
                  key={r.platform}
                  className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-900 p-4"
                >
                  <span className="text-sm font-medium text-gray-300">
                    {PLATFORM_LABELS[r.platform] ?? r.platform}
                  </span>
                  <span className="rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-2.5 py-1 text-sm font-bold text-black">
                    {r.score.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="rounded-lg border border-dashed border-gray-700 p-8 text-center text-sm text-gray-500">
              暂无平台评分数据。管理员可在
              <span className="text-yellow-400"> 评分管理 </span>
              中录入各平台评分。
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
