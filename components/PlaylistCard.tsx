'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'
import { Film, Heart, Lock, Globe, User } from 'lucide-react'
import type { Playlist } from '@/types/playlist'

type PlaylistCardProps = {
  playlist: Playlist
  /** 是否显示创建者信息（广场用） */
  showCreator?: boolean
  /** 是否显示收藏数（公开片单用） */
  showLikes?: boolean
  /** 底部操作按钮（我的片单页用） */
  actions?: ReactNode
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

export function PlaylistCard({ playlist, showCreator, showLikes, actions }: PlaylistCardProps) {
  return (
    <div className="group relative">
      <Link
        href={`/playlists/${playlist._id}`}
        className="block rounded-xl border border-gray-800 bg-gray-900/60 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/10"
      >
        <div className="flex flex-col gap-3 p-4">
          {/* 标题 + 公开状态 */}
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-base font-semibold text-white" title={playlist.title}>
              {playlist.title}
            </h3>
            {playlist.isPublic ? (
              <Globe className="size-4 shrink-0 text-gray-500" aria-label="公开" />
            ) : (
              <Lock className="size-4 shrink-0 text-gray-500" aria-label="私密" />
            )}
          </div>

          {/* 描述 */}
          {playlist.description && (
            <p className="line-clamp-2 text-xs text-gray-400">{playlist.description}</p>
          )}

          {/* 标签 */}
          {playlist.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {playlist.tags.map((tag, i) => (
                <span
                  key={tag}
                  className={`rounded-md px-1.5 py-0.5 text-[11px] font-medium ${TAG_COLORS[i % TAG_COLORS.length]}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 底部信息 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Film className="size-3.5" />
                {playlist.movies.length} 部
              </span>
              {showLikes && (
                <span className="flex items-center gap-1">
                  <Heart className="size-3.5" />
                  {playlist.likes}
                </span>
              )}
            </div>
            {showCreator && playlist.creator ? (
              <span className="flex items-center gap-1">
                <User className="size-3.5" />
                {playlist.creator.name}
              </span>
            ) : (
              <span>{formatDate(playlist.createdAt)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* 操作按钮（悬浮在卡片上方，阻止冒泡避免触发导航） */}
      {actions && (
        <div
          className="absolute right-2 bottom-2 z-10 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => e.preventDefault()}
        >
          {actions}
        </div>
      )}
    </div>
  )
}
