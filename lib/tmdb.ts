import axios from 'axios'

const TMDB_BASE = 'https://api.tmdb.org/3'

export interface TMDBMovieDetail {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  runtime: number
  genres: { id: number; name: string }[]
  vote_average: number
  vote_count: number
  tagline: string
  status: string
  budget: number
  revenue: number
  production_companies: { id: number; name: string }[]
}

export async function fetchMovieById(tmdbId: number): Promise<TMDBMovieDetail | null> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) throw new Error('TMDB_API_KEY 未配置')

  try {
    const { data } = await axios.get<TMDBMovieDetail>(
      `${TMDB_BASE}/movie/${tmdbId}`,
      { params: { api_key: apiKey, language: 'zh-CN' } }
    )
    return data
  } catch {
    return null
  }
}
