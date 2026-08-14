'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import {
  Heart,
  Lock,
  Globe,
  Plus,
  Trash2,
  Search,
  Loader2,
  User,
  Film,
  Calendar,
} from 'lucide-react'
import type { Playlist } from '@/types/playlist'

interface MovieBasic {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  vote_average: number
}

interface SearchResult {
  id: number
  title: string
  poster_path: string | null
  release_date: string
  overview: string
  vote_average: number
}

const TAG_COLORS = [
  'bg-rose-500/20 text-rose-300',
  'bg-amber-500/20 text-amber-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-sky-500/20 text-sky-300',
  'bg-violet-500/20 text-violet-300',
  'bg-pink-500/20 text-pink-300',
]

function formatDate(iso: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function PlaylistDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { data: session } = useSession()

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [movies, setMovies] = useState<MovieBasic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [liked, setLiked] = useState(false)

  // 添加电影相关
  const [showAdd, setShowAdd] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [tmdbIdInput, setTmdbIdInput] = useState('')
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const fetchPlaylist = useCallback(async () => {
    try {
      const res = await fetch(`/api/playlists/${id}`)
      const data = await res.json()
      if (data.success) {
        setPlaylist(data.data)
      } else {
        setError(data.error || '获取片单失败')
      }
    } catch {
      setError('网络错误')
    } finally {
      setLoading(false)
    }
  }, [id])

  const fetchMovies = useCallback(async (ids: number[]) => {
    if (ids.length === 0) {
      setMovies([])
      return
    }
    try {
      const res = await fetch(`/api/tmdb/movies?ids=${ids.join(',')}`)
      const data = await res.json()
      if (data.success) {
        setMovies(data.data)
      }
    } catch {
      // 忽略
    }
  }, [])

  useEffect(() => {
    fetchPlaylist()
  }, [fetchPlaylist])

  useEffect(() => {
    if (playlist) {
      fetchMovies(playlist.movies)
    }
  }, [playlist, fetchMovies])

  async function handleSearch() {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(searchQuery.trim())}`)
      const data = await res.json()
      if (data.success) {
        setSearchResults(data.data)
      }
    } catch {
      // 忽略
    } finally {
      setSearching(false)
    }
  }

  async function addMovieByTmdbId(tmdbId: number) {
    try {
      const res = await fetch(`/api/playlists/${id}/movies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId }),
      })
      const data = await res.json()
      if (data.success) {
        showToast(`已添加「${data.data.addedMovie.title}」`)
        await fetchPlaylist()
        setSearchQuery('')
        setSearchResults([])
        setTmdbIdInput('')
      } else {
        showToast(data.error || '添加失败')
      }
    } catch {
      showToast('网络错误')
    }
  }

  async function removeMovie(tmdbId: number) {
    try {
      const res = await fetch(`/api/playlists/${id}/movies`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tmdbId }),
      })
      const data = await res.json()
      if (data.success) {
        showToast('已移除电影')
        await fetchPlaylist()
      } else {
        showToast(data.error || '移除失败')
      }
    } catch {
      showToast('网络错误')
    }
  }

  async function toggleLike() {
    try {
      const method = liked ? 'DELETE' : 'POST'
      const res = await fetch(`/api/playlists/${id}/like`, { method })
      const data = await res.json()
      if (data.success) {
        setLiked(!liked)
        setPlaylist((prev) => (prev ? { ...prev, likes: data.likes } : prev))
      }
    } catch {
      // 忽略
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-yellow-400" />
      </div>
    )
  }

  if (error || !playlist) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error || '片单不存在'}</p>
        <Link href="/playlists/explore" className="text-yellow-400 hover:underline">
          去片单广场看看
        </Link>
      </div>
    )
  }

  const isOwner = playlist.isOwner === true

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* 头部信息 */}
      <div className="mb-8 rounded-xl border border-gray-800 bg-gray-900/60 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{playlist.title}</h1>
              {playlist.isPublic ? (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Globe className="size-4" /> 公开
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Lock className="size-4" /> 私密
                </span>
              )}
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="size-3.5" />
                创建于 {formatDate(playlist.createdAt)}
              </span>
            </div>

            {playlist.description && (
              <p className="mt-2 text-sm text-gray-400">{playlist.description}</p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
              {playlist.creator && (
                <span className="flex items-center gap-1">
                  <User className="size-3.5" />
                  {playlist.creator.name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Film className="size-3.5" />
                {playlist.movies.length} 部电影
              </span>
            </div>

            {playlist.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {playlist.tags.map((tag, i) => (
                  <span
                    key={tag}
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* 收藏按钮（公开片单可见） */}
            {playlist.isPublic && (
              <button
                type="button"
                onClick={toggleLike}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm transition-colors ${
                  liked
                    ? 'border-red-500 bg-red-900/30 text-red-300'
                    : 'border-gray-700 bg-gray-800 text-gray-300 hover:border-red-500/50'
                }`}
              >
                <Heart className={`size-4 ${liked ? 'fill-current' : ''}`} />
                {playlist.likes}
              </button>
            )}

            {/* 添加电影（仅创建者） */}
            {isOwner && (
              <button
                type="button"
                onClick={() => setShowAdd((v) => !v)}
                className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-3 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
              >
                <Plus className="size-4" />
                添加电影
              </button>
            )}
          </div>
        </div>

        {/* 添加电影面板 */}
        {showAdd && isOwner && (
          <div className="mt-4 rounded-lg border border-gray-700 bg-gray-800/50 p-4">
            {/* 搜索 */}
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="搜索电影名称..."
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={searching}
                className="flex items-center gap-1 rounded-md bg-gray-700 px-3 py-2 text-sm text-white hover:bg-gray-600 disabled:opacity-50"
              >
                {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                搜索
              </button>
            </div>

            {/* 搜索结果 */}
            {searchResults.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {searchResults.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-md bg-gray-900 p-2"
                  >
                    {r.poster_path && (
                      <img
                        src={`https://image.tmdb.org/t/p/w92${r.poster_path}`}
                        alt={r.title}
                        className="h-12 w-8 rounded object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{r.title}</p>
                      <p className="text-xs text-gray-500">
                        {r.release_date?.slice(0, 4) || '未知年份'} · TMDB {r.vote_average.toFixed(1)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => addMovieByTmdbId(r.id)}
                      className="rounded-md bg-yellow-500 px-2.5 py-1 text-xs font-semibold text-black hover:bg-yellow-400"
                    >
                      添加
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* 直接输入 TMDB ID */}
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                value={tmdbIdInput}
                onChange={(e) => setTmdbIdInput(e.target.value)}
                className="flex-1 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="或直接输入 TMDB ID"
              />
              <button
                type="button"
                onClick={() => {
                  const n = parseInt(tmdbIdInput)
                  if (n > 0) addMovieByTmdbId(n)
                }}
                className="rounded-md bg-gray-700 px-3 py-2 text-sm text-white hover:bg-gray-600"
              >
                添加
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 电影列表 */}
      {movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-700 p-16 text-center">
          <Film className="size-10 text-gray-600" />
          <p className="text-gray-400">
            {isOwner ? '片单还是空的，点击「添加电影」开始收藏' : '这个片单还没有电影'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {movies.map((m) => (
            <div key={m.id} className="group relative">
              <Link href={`/movie/${m.id}`} className="block">
                <div className="relative aspect-2/3 w-full overflow-hidden rounded-xl border border-gray-800 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
                  {m.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${m.poster_path}`}
                      alt={m.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-800 text-gray-500">
                      无海报
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <p className="absolute right-2 bottom-2 left-2 truncate text-xs font-medium text-white">
                    {m.title}
                  </p>
                </div>
              </Link>

              {/* 移除按钮（仅创建者） */}
              {isOwner && (
                <button
                  type="button"
                  onClick={() => removeMovie(m.id)}
                  className="absolute top-2 right-2 rounded-md bg-black/70 p-1.5 text-red-300 opacity-0 transition-opacity hover:bg-red-900/80 group-hover:opacity-100"
                  title="从片单移除"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-md bg-gray-800 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
