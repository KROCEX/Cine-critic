'use client'

import { useState, type FormEvent } from 'react'
import { Loader2, Search, AlertTriangle } from 'lucide-react'

const PLATFORMS = [
  { value: 'douban', label: '豆瓣' },
  { value: 'imdb', label: 'IMDb' },
  { value: 'metacritic', label: 'Metacritic' },
  { value: 'rottentomatoes', label: '烂番茄' },
]

interface MovieInfo {
  _id: string
  tmdbId: number
  title: string
  posterPath: string | null
  platformRatings: { platform: string; score: number }[]
  bayesianRating: number | null
  ratingCount: number
}

export default function AdminRatingsPage() {
  const [tmdbIdInput, setTmdbIdInput] = useState('')
  const [platform, setPlatform] = useState('douban')
  const [score, setScore] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchedMovie, setSearchedMovie] = useState<MovieInfo | null>(null)
  const [searching, setSearching] = useState(false)

  const tmdbId = parseInt(tmdbIdInput) || 0

  async function handleSearch() {
    if (!tmdbId) return
    setSearching(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/admin/ratings?tmdbId=${tmdbId}`)
      // Fallback: 使用 popular API 查找
      const fallbackRes = await fetch('/api/movies/popular')
      const fallbackData = await fallbackRes.json()
      if (fallbackData.success) {
        const found = fallbackData.data.find((m: MovieInfo) => m.tmdbId === tmdbId)
        if (found) {
          setSearchedMovie(found)
        } else {
          setSearchedMovie(null)
          setMessage({ type: 'error', text: '未找到该 TMDB ID 的电影，请先在首页加载' })
        }
      }
    } catch {
      setMessage({ type: 'error', text: '查询失败' })
    } finally {
      setSearching(false)
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!tmdbId || !score) return

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tmdbId,
          platform,
          score: parseFloat(score),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setSearchedMovie(data.data)
        setMessage({
          type: 'success',
          text: `已为「${data.data.title}」录入 ${PLATFORMS.find((p) => p.value === platform)?.label} 评分 ${score}（贝叶斯: ${data.data.bayesianRating}）`,
        })
        setScore('')
      } else {
        setMessage({ type: 'error', text: data.error || '录入失败' })
      }
    } catch {
      setMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6 flex items-center gap-2 rounded-md border border-yellow-600/40 bg-yellow-900/20 px-4 py-3 text-sm text-yellow-300">
        <AlertTriangle className="size-5 shrink-0" />
        <span>⚠️ 管理员工具 — 仅授权管理员使用</span>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-white">评分管理</h1>
      <p className="mb-6 text-sm text-gray-400">
        通过 TMDB ID 查找电影并录入各平台评分。
      </p>

      {message && (
        <div
          className={`mb-4 rounded-md p-3 text-sm ${
            message.type === 'success'
              ? 'bg-green-900/30 text-green-300'
              : 'bg-red-900/30 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* 查找电影 */}
      <div className="mb-6 rounded-lg border border-gray-700 bg-gray-900 p-4">
        <label className="mb-2 block text-sm text-gray-400">TMDB ID</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={tmdbIdInput}
            onChange={(e) => setTmdbIdInput(e.target.value)}
            className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
            placeholder="例如: 969681"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={searching || !tmdbId}
            className="flex items-center gap-1 rounded-md bg-gray-700 px-4 py-2 text-sm text-white transition-colors hover:bg-gray-600 disabled:opacity-50"
          >
            {searching ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
            查询
          </button>
        </div>
      </div>

      {/* 查询结果 */}
      {searchedMovie && (
        <div className="mb-6 rounded-lg border border-gray-700 bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            {searchedMovie.posterPath && (
              <img
                src={`https://image.tmdb.org/t/p/w92${searchedMovie.posterPath}`}
                alt={searchedMovie.title}
                className="h-20 w-14 rounded object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-white">{searchedMovie.title}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-0.5 text-sm font-bold text-black">
                  {searchedMovie.bayesianRating !== null
                    ? searchedMovie.bayesianRating.toFixed(1)
                    : '待评分'}
                </span>
                <span className="text-xs text-gray-500">
                  来自 {searchedMovie.ratingCount} 个平台
                </span>
              </div>
            </div>
          </div>

          {searchedMovie.platformRatings.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {searchedMovie.platformRatings.map((r) => (
                <span key={r.platform} className="rounded bg-gray-800 px-2 py-1 text-gray-300">
                  {PLATFORMS.find((p) => p.value === r.platform)?.label ?? r.platform}: {r.score}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 录入评分表单 */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-gray-700 bg-gray-900 p-4">
        <h2 className="font-semibold text-white">录入 / 更新评分</h2>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">评分平台</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:border-yellow-500 focus:outline-none"
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">评分 (0-10，步长 0.1)</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
            placeholder="例如: 8.5"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || !tmdbId}
          className="rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? '提交中...' : '提交评分'}
        </button>
      </form>
    </div>
  )
}
