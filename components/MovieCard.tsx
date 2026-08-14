import Image from 'next/image'
import Link from 'next/link'
import { Star, Users } from 'lucide-react'

export type PlatformRating = {
  platform: string
  score: number
}

export type Movie = {
  _id: string
  tmdbId: number
  title: string
  posterPath: string | null
  releaseDate: string
  platformRatings: PlatformRating[]
  bayesianRating: number | null
  ratingCount: number
}

type MovieCardProps = {
  movie: Movie
  /** 榜单序号，可选 */
  rank?: number
}

function getScoreLabel(bayesianRating: number | null): {
  text: string
  hasScore: boolean
} {
  if (bayesianRating === null || bayesianRating === undefined) {
    return { text: '待评分', hasScore: false }
  }
  return { text: bayesianRating.toFixed(1), hasScore: true }
}

function getReleaseYear(releaseDate: string): string {
  if (!releaseDate) return ''
  return releaseDate.slice(0, 4)
}

const PLATFORM_LABELS: Record<string, string> = {
  douban: '豆瓣',
  imdb: 'IMDb',
  metacritic: 'Metacritic',
  rotten_tomatoes: '烂番茄',
  letterboxd: 'Letterboxd',
}

export function MovieCard({ movie, rank }: MovieCardProps) {
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : 'https://via.placeholder.com/500x750/333333/FFFFFF?text=No+Poster'

  const { text: scoreLabel, hasScore } = getScoreLabel(movie.bayesianRating)
  const year = getReleaseYear(movie.releaseDate)
  const ratingCount = movie.ratingCount ?? 0

  return (
    <Link
      href={`/movie/${movie._id}`}
      className="group focus-visible:ring-ring focus-visible:ring-offset-background block rounded-xl focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <article className="border-border bg-card relative overflow-hidden rounded-xl border transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl group-hover:shadow-yellow-500/20">
        {/* 海报 */}
        <div className="relative aspect-2/3 w-full overflow-hidden">
          <Image
            src={posterUrl}
            alt={`《${movie.title}》电影海报`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
            unoptimized
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
            aria-hidden="true"
          />

          {/* 科学评分徽章 */}
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-1 text-sm font-bold text-black shadow-lg">
            {hasScore && (
              <Star className="size-3 fill-current" aria-hidden="true" />
            )}
            <span>{scoreLabel}</span>
            <span className="sr-only">分，综合评分</span>
          </div>

          {typeof rank === 'number' && (
            <div className="bg-background/80 text-foreground border-border absolute top-2 left-2 rounded-md border px-1.5 py-0.5 font-mono text-[11px] backdrop-blur-sm">
              #{rank}
            </div>
          )}
        </div>

        {/* 信息区 */}
        <div className="flex flex-col gap-1 p-3">
          <h3
            className="text-card-foreground truncate text-sm font-semibold"
            title={movie.title}
          >
            {movie.title}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground truncate text-xs">
              {year ? `${year}` : ''}
            </p>
            {ratingCount > 0 && (
              <span className="text-muted-foreground flex items-center gap-0.5 text-[10px]">
                <Users className="size-3" aria-hidden="true" />
                来自 {ratingCount} 个平台
              </span>
            )}
          </div>
        </div>
      </article>
    </Link>
  )
}
