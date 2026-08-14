import Image from 'next/image'
import { Play, Quote, Star } from 'lucide-react'

type HeroBannerProps = {
  title: string
  year: number
  genre: string
  score: number
  review: string
  reviewer: string
  backdrop: string
}

export function HeroBanner({
  title,
  year,
  genre,
  score,
  review,
  reviewer,
  backdrop,
}: HeroBannerProps) {
  return (
    <section
      className="border-border relative aspect-video w-full overflow-hidden rounded-2xl border"
      aria-label="本周焦点电影"
    >
      <Image
        src={backdrop || '/placeholder.svg'}
        alt={`《${title}》剧照`}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/10"
        aria-hidden="true"
      />

      <div className="relative flex h-full flex-col justify-end gap-3 p-5 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2.5 py-1 text-xs font-bold text-black">
            <Star className="size-3 fill-current" aria-hidden="true" />
            {score.toFixed(1)}
          </span>
          <span className="border-border/60 rounded-full border bg-black/40 px-2.5 py-1 text-xs text-neutral-200 backdrop-blur-sm">
            本周焦点
          </span>
          <span className="text-xs text-neutral-300">
            {year} · {genre}
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-balance text-neutral-50 sm:text-4xl lg:text-5xl">
          {title}
        </h1>

        <p className="flex max-w-2xl items-start gap-2 text-sm leading-relaxed text-pretty text-neutral-300 sm:text-base">
          <Quote className="mt-1 size-4 shrink-0 text-yellow-400" aria-hidden="true" />
          <span>
            {review}
            <span className="text-muted-foreground ml-2 text-xs">— {reviewer}</span>
          </span>
        </p>

        <div className="mt-2 flex flex-wrap gap-3">
          <button
            type="button"
            className="flex items-center gap-2 rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            <Play className="size-4 fill-current" aria-hidden="true" />
            观看预告片
          </button>
          <button
            type="button"
            className="rounded-md border border-neutral-600 bg-black/40 px-4 py-2 text-sm font-medium text-neutral-100 backdrop-blur-sm transition-colors hover:bg-black/60"
          >
            加入我的片单
          </button>
        </div>
      </div>
    </section>
  )
}
