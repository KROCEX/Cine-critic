/** 前端共享的片单类型 */

export interface PlaylistCreator {
  id: string
  name: string
}

export interface Playlist {
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
  creator?: PlaylistCreator | null
  isOwner?: boolean
}
