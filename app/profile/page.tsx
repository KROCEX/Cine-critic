'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Loader2, Globe, User } from 'lucide-react'
import { PlaylistCard } from '@/components/PlaylistCard'
import type { Playlist } from '@/types/playlist'

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') {
      setLoading(false)
      return
    }
    fetch('/api/playlists/my')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPlaylists(data.data.filter((p: Playlist) => p.isPublic))
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [status])

  if (status === 'unauthenticated') {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <p className="text-gray-400">请先登录查看个人主页</p>
        <Link
          href="/auth/login"
          className="rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 font-semibold text-black"
        >
          去登录
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      {/* 用户信息 */}
      <div className="mb-8 flex items-center gap-4">
        <span className="flex size-16 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-2xl font-bold text-black">
          {session?.user?.name?.slice(0, 2) ?? '?'}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-white">{session?.user?.name}</h1>
          <p className="flex items-center gap-1 text-sm text-gray-400">
            <User className="size-3.5" />
            {session?.user?.email}
          </p>
        </div>
      </div>

      {/* 公开片单区域 */}
      <div className="mb-4 flex items-center gap-2">
        <Globe className="size-5 text-yellow-400" />
        <h2 className="text-xl font-bold text-white">公开片单</h2>
        <span className="text-sm text-gray-500">({playlists.length})</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-7 animate-spin text-yellow-400" />
        </div>
      ) : playlists.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-700 p-12 text-center text-gray-500">
          还没有公开片单
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlists.map((p) => (
            <PlaylistCard key={p._id} playlist={p} showLikes />
          ))}
        </div>
      )}
    </div>
  )
}
