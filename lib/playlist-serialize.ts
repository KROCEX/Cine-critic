import type { IPlaylist } from '@/models/Playlist'

/** 序列化后的片单对象（用于 API 响应） */
export interface SerializedPlaylist {
  _id: string
  userId: string
  title: string
  description: string
  tags: string[]
  isPublic: boolean
  movies: number[]
  likes: number
  createdAt: string
  updatedAt: string
}

/** 提取对象 ID（兼容 ObjectId、字符串、以及 populate 后的文档对象） */
function extractId(value: unknown): string {
  if (value == null) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'object' && '_id' in value) {
    return String((value as { _id: unknown })._id)
  }
  return String(value)
}

/**
 * 将 Mongoose 文档（或 lean 对象）序列化为可安全 JSON 输出的纯对象。
 */
export function serializePlaylist(doc: {
  _id: unknown
  userId: unknown
  title: string
  description?: string | null
  tags?: string[]
  isPublic?: boolean
  movies?: number[]
  likes?: number
  createdAt?: Date | string
  updatedAt?: Date | string
}): SerializedPlaylist {
  return {
    _id: extractId(doc._id),
    userId: extractId(doc.userId),
    title: doc.title,
    description: doc.description ?? '',
    tags: doc.tags ?? [],
    isPublic: doc.isPublic ?? true,
    movies: doc.movies ?? [],
    likes: doc.likes ?? 0,
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : String(doc.createdAt ?? ''),
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : String(doc.updatedAt ?? ''),
  }
}
