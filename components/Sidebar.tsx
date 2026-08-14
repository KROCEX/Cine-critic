'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import {
  Clapperboard,
  Compass,
  Home,
  ListVideo,
  LogIn,
  LogOut,
  Menu,
  MessagesSquare,
  Newspaper,
  Shield,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type NavItem = {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: NavItem[] = [
  { label: '首页', href: '/', icon: Home },
  { label: '发现', href: '/discover', icon: Compass },
  { label: '我的片单', href: '/collections', icon: ListVideo },
  { label: '论坛', href: '/forum', icon: MessagesSquare },
  { label: '资讯', href: '/news', icon: Newspaper },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isLoggedIn = status === 'authenticated' && !!session?.user
  const isAdmin = session?.user?.role === 'admin'

  const userInitials = session?.user?.name
    ? session.user.name.slice(0, 2)
    : '?'

  return (
    <>
      {/* 移动端顶栏 */}
      <div className="bg-sidebar border-sidebar-border sticky top-0 z-50 flex h-14 items-center gap-2 border-b px-4 md:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground -ml-2 rounded-md p-2 transition-colors"
          aria-label="打开导航菜单"
        >
          <Menu className="size-5" />
        </button>
        <span
          className="from-primary to-chart-2 flex size-7 items-center justify-center rounded-md bg-gradient-to-br"
          aria-hidden="true"
        >
          <Clapperboard className="text-primary-foreground size-4" />
        </span>
        <span className="text-sm font-semibold tracking-tight">CineCritic</span>
      </div>

      {/* 移动端遮罩 */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="关闭导航菜单"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 md:hidden"
        />
      )}

      <aside
        className={cn(
          'bg-sidebar border-sidebar-border fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r transition-transform duration-300 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
        aria-label="主导航"
      >
        {/* Logo */}
        <div className="border-sidebar-border flex h-16 items-center gap-2 border-b px-5">
          <span
            className="from-primary to-chart-2 flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br"
            aria-hidden="true"
          >
            <Clapperboard className="text-primary-foreground size-5" />
          </span>
          <div className="leading-tight">
            <p className="text-sidebar-foreground text-base font-semibold tracking-tight">
              CineCritic
            </p>
            <p className="text-muted-foreground text-[11px]">影迷科学评分社区</p>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          <p className="text-muted-foreground px-3 pt-2 pb-1 text-[11px] font-medium tracking-widest uppercase">
            浏览
          </p>
          {navItems.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                )}
              >
                <Icon className="size-[18px] shrink-0" />
                <span className="truncate">{item.label}</span>
                {active && (
                  <span className="bg-primary ml-auto h-4 w-1 rounded-full" aria-hidden="true" />
                )}
              </Link>
            )
          })}

          {/* 管理员导航 */}
          {isAdmin && (
            <>
              <p className="text-muted-foreground px-3 pt-4 pb-1 text-[11px] font-medium tracking-widest uppercase">
                管理
              </p>
              <Link
                href="/admin/ratings"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  pathname === '/admin/ratings'
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground',
                )}
              >
                <Shield className="size-[18px] shrink-0" />
                <span className="truncate">评分管理</span>
              </Link>
            </>
          )}
        </nav>

        {/* 底部：登录/注册 或 用户信息 */}
        <div className="border-sidebar-border border-t p-3">
          {isLoggedIn ? (
            <div className="flex items-center gap-3 rounded-md px-2 py-2">
              <span
                className="bg-secondary text-primary border-border flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
                aria-hidden="true"
              >
                {userInitials}
              </span>
              <div className="min-w-0 flex-1 leading-tight">
                <p className="text-sidebar-foreground truncate text-sm font-medium">
                  {session?.user?.name}
                </p>
                <p className="text-muted-foreground truncate text-xs">
                  {isAdmin ? '管理员' : session?.user?.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: '/' })}
                className="text-muted-foreground hover:bg-sidebar-accent hover:text-red-400 rounded-md p-2 transition-colors"
                title="退出登录"
              >
                <LogOut className="size-4" />
                <span className="sr-only">退出登录</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link
                href="/auth/login"
                onClick={() => setMobileOpen(false)}
                className="from-primary to-chart-2 text-primary-foreground flex items-center justify-center gap-2 rounded-md bg-gradient-to-r px-3 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
              >
                <LogIn className="size-4" />
                登录
              </Link>
              <Link
                href="/auth/register"
                onClick={() => setMobileOpen(false)}
                className="border-border text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground flex items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors"
              >
                <UserPlus className="size-4" />
                注册新账号
              </Link>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
