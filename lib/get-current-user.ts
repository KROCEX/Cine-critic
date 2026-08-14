import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

/**
 * 获取当前登录用户 ID（用于服务端鉴权）。
 * 未登录返回 null。
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}
