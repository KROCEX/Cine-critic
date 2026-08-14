'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Plus, Pencil, Trash2, Loader2, ListVideo } from 'lucide-react'
import { PlaylistCard } from '@/components/PlaylistCard'
import { PlaylistModal } from '@/components/PlaylistModal'
import type { Playlist } from '@/types/playlist'

export default function MyPlaylistsPage() {
  const { status } = useSession()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Playlist | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }, [])

  const fetchPlaylists = useCallback(async () => {
    try {
      const res = await fetch('/api/playlists/my')
      const data = await res.json()
      if (data.success) {
        setPlaylists(data.data)
      }
    } catch {
      // 忽略加载错误
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchPlaylists()
    } else if (status === 'unauthenticated') {
      setLoading(false)
    }
  }, [status, fetchPlaylists])

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(p: Playlist) {
    setEditing(p)
    setModalOpen(true)
  }

  async function handleDelete(p: Playlist) {
    if (!confirm(`确定删除片单「${p.title}」吗？此操作不可恢复。`)) return
    try {
      const res = await fetch(`/api/playlists/${p._id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setPlaylists((prev) => prev.filter((x) => x._id !== p._id))
        showToast('片单已删除')
      } else {
        showToast(data.error || '删除失败')
      }
    } catch {
      showToast('网络错误')
    }
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-gray-400">请先登录后查看你的片单</p>
        <Link
          href="/auth/login"
          className="rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 font-semibold text-black"
        >
          去登录
        </Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-8 animate-spin text-yellow-400" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* 顶部栏 */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">我的片单</h1>
          <p className="mt-1 text-sm text-gray-400">管理你创建的所有片单</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" />
          新建片单
        </button>
      </div>

      {/* 空状态 */}
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-gray-700 p-16 text-center">
          <ListVideo className="size-10 text-gray-600" />
          <p className="text-gray-400">你还没有创建任何片单</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-2 rounded-md bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700"
          >
            创建第一个片单
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlists.map((p) => (
            <PlaylistCard
              key={p._id}
              playlist={p}
              actions={
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openEdit(p)
                    }}
                    className="flex items-center gap-1 rounded-md bg-gray-800/90 px-2 py-1 text-xs text-white hover:bg-gray-700"
                  >
                    <Pencil className="size-3" />
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(p)
                    }}
                    className="flex items-center gap-1 rounded-md bg-red-900/80 px-2 py-1 text-xs text-red-200 hover:bg-red-800"
                  >
                    <Trash2 className="size-3" />
                    删除
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      {/* 新建/编辑弹窗 */}
      <PlaylistModal
        open={modalOpen}
        playlist={editing}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          fetchPlaylists()
          showToast(editing ? '片单已更新' : '片单已创建')
        }}
      />

      {/* Toast 提示 */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-md bg-gray-800 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
