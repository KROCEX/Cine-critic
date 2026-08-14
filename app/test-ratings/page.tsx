'use client'

import { useEffect, useState, useCallback } from 'react'

interface MovieSummary {
  _id: string
  title: string
  platformRatings: { platform: string; score: number }[]
  bayesianRating: number | null
  ratingCount: number
}

const PLATFORMS = [
  { value: 'douban', label: '豆瓣' },
  { value: 'imdb', label: 'IMDb' },
  { value: 'metacritic', label: 'Metacritic' },
  { value: 'rotten_tomatoes', label: '烂番茄' },
  { value: 'letterboxd', label: 'Letterboxd' },
]

export default function TestRatingsPage() {
  const [movies, setMovies] = useState<MovieSummary[]>([])
  const [selectedMovie, setSelectedMovie] = useState('')
  const [platform, setPlatform] = useState('douban')
  const [score, setScore] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchMovies = useCallback(async () => {
    try {
      const res = await fetch('/api/movies/popular')
      const data = await res.json()
      if (data.success) {
        setMovies(data.data)
      }
    } catch {
      // 忽略加载错误
    }
  }, [])

  useEffect(() => {
    fetchMovies()
  }, [fetchMovies])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedMovie || !score) return

    setSubmitting(true)
    setMessage(null)

    try {
      const res = await fetch(`/api/movies/${selectedMovie}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          score: parseFloat(score),
        }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage({
          type: 'success',
          text: `已为「${data.data.title}」录入 ${PLATFORMS.find((p) => p.value === platform)?.label} 评分 ${score}（贝叶斯评分: ${data.data.bayesianRating}）`,
        })
        setScore('')
        fetchMovies()
      } else {
        setMessage({ type: 'error', text: data.error || '录入失败' })
      }
    } catch {
      setMessage({ type: 'error', text: '网络错误，请重试' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-bold">科学评分测试工具</h1>
      <p className="mb-6 text-sm text-gray-500">
        手动为电影录入平台评分，测试贝叶斯评分算法。
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

      <form onSubmit={handleSubmit} className="mb-8 flex flex-col gap-4 rounded-lg border border-gray-700 bg-gray-900 p-4">
        {/* 选择电影 */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">选择电影</label>
          <select
            value={selectedMovie}
            onChange={(e) => setSelectedMovie(e.target.value)}
            className="rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white"
            required
          >
            <option value="">-- 请选择 --</option>
            {movies.map((m) => (
              <option key={m._id} value={m._id}>
                {m.title}（当前 {m.ratingCount} 个评分）
              </option>
            ))}
          </select>
        </div>

        {/* 选择平台 */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">评分平台</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            className="rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white"
          >
            {PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* 分数 */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-gray-400">评分 (0-10)</label>
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="rounded-md border border-gray-600 bg-gray-800 px-3 py-2 text-white"
            placeholder="例如: 8.5"
            required
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 font-bold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? '提交中...' : '录入评分'}
        </button>
      </form>

      {/* 当前评分列表 */}
      <h2 className="mb-3 text-lg font-semibold">当前电影评分概况</h2>
      <div className="flex flex-col gap-3">
        {movies
          .filter((m) => m.ratingCount > 0)
          .map((m) => (
            <div
              key={m._id}
              className="rounded-lg border border-gray-700 bg-gray-900 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-white">{m.title}</span>
                <span className="rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-0.5 text-sm font-bold text-black">
                  {m.bayesianRating?.toFixed(1) ?? 'N/A'}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-400">
                {m.platformRatings.map((r) => (
                  <span key={r.platform} className="rounded bg-gray-800 px-1.5 py-0.5">
                    {PLATFORMS.find((p) => p.value === r.platform)?.label ?? r.platform}: {r.score}
                  </span>
                ))}
              </div>
            </div>
          ))}
        {movies.filter((m) => m.ratingCount > 0).length === 0 && (
          <p className="text-sm text-gray-500">暂无评分数据，请使用上方表单录入评分。</p>
        )}
      </div>
    </div>
  )
}
