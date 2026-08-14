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

export interface TMDBMovieBasic {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
}

export interface TMDBMovieSearchResult {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  overview: string
  vote_average: number
}

/** 按关键词搜索电影 */
export async function searchMovies(query: string): Promise<TMDBMovieSearchResult[]> {
  const apiKey = process.env.TMDB_API_KEY
  if (!apiKey) throw new Error('TMDB_API_KEY 未配置')

  try {
    const { data } = await axios.get<{ results: TMDBMovieSearchResult[] }>(
      `${TMDB_BASE}/search/movie`,
      { params: { api_key: apiKey, language: 'zh-CN', query, page: 1 } }
    )
    return data.results.slice(0, 10)
  } catch {
    return []
  }
}

/** 批量获取电影基本信息 */
export async function fetchMoviesByIds(tmdbIds: number[]): Promise<TMDBMovieBasic[]> {
  const results = await Promise.all(
    tmdbIds.map(async (id) => {
      const detail = await fetchMovieById(id)
      if (!detail) return null
      return {
        id: detail.id,
        title: detail.title,
        poster_path: detail.poster_path,
        release_date: detail.release_date,
        vote_average: detail.vote_average,
      }
    })
  )
  return results.filter((r): r is TMDBMovieBasic => r !== null)
}
