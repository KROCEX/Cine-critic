'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2, ChevronLeft, ChevronRight, Library } from 'lucide-react'
import { PlaylistCard } from '@/components/PlaylistCard'
import type { Playlist } from '@/types/playlist'

const PAGE_SIZE = 12

export default function ExplorePage() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchPlaylists = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/playlists/explore?page=${p}&limit=${PAGE_SIZE}`)
      const data = await res.json()
      if (data.success) {
        setPlaylists(data.data)
        setTotalPages(data.pagination?.totalPages ?? 1)
      }
    } catch {
      // 忽略
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPlaylists(page)
  }, [page, fetchPlaylists])

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">片单广场</h1>
        <p className="mt-1 text-sm text-gray-400">发现影迷们精心整理的片单</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-yellow-400" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-700 p-16 text-center">
          <Library className="size-10 text-gray-600" />
          <p className="text-gray-400">还没有公开片单，快来创建第一个吧</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {playlists.map((p) => (
              <PlaylistCard key={p._id} playlist={p} showCreator showLikes />
            ))}
          </div>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setPage((v) => Math.max(1, v - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
                上一页
              </button>
              <span className="text-sm text-gray-400">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((v) => Math.min(totalPages, v + 1))}
                disabled={page >= totalPages}
                className="flex items-center gap-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white disabled:opacity-40"
              >
                下一页
                <ChevronRight className="size-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
