'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { X, Loader2, Plus } from 'lucide-react'
import { TAG_PRESETS } from '@/lib/playlist-tags'
import type { Playlist } from '@/types/playlist'

type PlaylistModalProps = {
  open: boolean
  /** 传入则进入编辑模式 */
  playlist?: Playlist | null
  onClose: () => void
  onSaved: () => void
}

export function PlaylistModal({ open, playlist, onClose, onSaved }: PlaylistModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isPublic, setIsPublic] = useState(true)
  const [tagInput, setTagInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const isEdit = !!playlist
  // 公开片单不可改回私密（编辑已公开的片单时禁用开关）
  const isPublicLocked = isEdit && playlist?.isPublic === true

  // 打开时初始化表单
  useEffect(() => {
    if (open) {
      setTitle(playlist?.title ?? '')
      setDescription(playlist?.description ?? '')
      setTags(playlist?.tags ?? [])
      setIsPublic(playlist?.isPublic ?? true)
      setTagInput('')
      setError(null)
    }
  }, [open, playlist])

  if (!open) return null

  function toggleTag(tag: string) {
    setTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  function addCustomTag() {
    const t = tagInput.trim()
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags((prev) => [...prev, t])
    }
    setTagInput('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!title.trim()) {
      setError('请输入片单标题')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(isEdit ? `/api/playlists/${playlist._id}` : '/api/playlists', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          tags,
          isPublic,
        }),
      })

      const data = await res.json()
      if (data.success) {
        onSaved()
        onClose()
      } else {
        setError(data.error || '保存失败')
      }
    } catch {
      setError('网络错误，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div className="absolute inset-0 bg-black/70" onClick={onClose} aria-hidden="true" />

      {/* 弹窗 */}
      <div className="relative w-full max-w-md rounded-xl border border-gray-700 bg-gray-900 p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-md p-1 text-gray-400 hover:bg-gray-800 hover:text-white"
          aria-label="关闭"
        >
          <X className="size-5" />
        </button>

        <h2 className="mb-4 text-lg font-bold text-white">
          {isEdit ? '编辑片单' : '新建片单'}
        </h2>

        {error && (
          <div className="mb-4 rounded-md bg-red-900/30 p-3 text-sm text-red-300">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 标题 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">标题（必填，≤30 字）</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={30}
              className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              placeholder="例如：周末惊悚夜"
              required
            />
          </div>

          {/* 描述 */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-400">描述（可选，≤100 字）</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={100}
              rows={2}
              className="resize-none rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              placeholder="一句话介绍这个片单"
            />
          </div>

          {/* 标签 */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-400">标签（可多选或自定义）</label>
            <div className="flex flex-wrap gap-1.5">
              {Object.values(TAG_PRESETS)
                .flat()
                .map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-md px-2 py-1 text-xs transition-colors ${
                      tags.includes(tag)
                        ? 'bg-yellow-500/30 text-yellow-300 ring-1 ring-yellow-500/50'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomTag()
                  }
                }}
                className="flex-1 rounded-md border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="自定义标签"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="flex items-center gap-1 rounded-md bg-gray-700 px-3 py-1.5 text-sm text-white hover:bg-gray-600"
              >
                <Plus className="size-4" />
                添加
              </button>
            </div>
          </div>

          {/* 公开/私密切换 */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <label className="text-sm text-gray-400">公开片单</label>
              {isPublicLocked && (
                <span className="text-[11px] text-amber-400/80">
                  公开片单不可改回私密
                </span>
              )}
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isPublic}
              disabled={isPublicLocked}
              onClick={() => setIsPublic((v) => !v)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                isPublicLocked
                  ? 'cursor-not-allowed bg-yellow-500/60'
                  : isPublic
                    ? 'bg-yellow-500'
                    : 'bg-gray-700'
              }`}
            >
              {/* 圆点：left 固定 + translate 控制，始终在底座范围内 */}
              <span
                className={`absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform ${
                  isPublic ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-md bg-gradient-to-r from-yellow-400 to-orange-500 py-2 font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                保存中...
              </>
            ) : isEdit ? (
              '保存修改'
            ) : (
              '创建片单'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
