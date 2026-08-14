import { Construction } from 'lucide-react'

type PagePlaceholderProps = {
  title: string
  description: string
}

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed text-pretty">
          {description}
        </p>
      </header>

      <div className="border-border bg-card text-muted-foreground flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-12 text-center">
        <Construction className="text-primary size-6" aria-hidden="true" />
        <p className="text-sm">该模块正在建设中，脚手架已为你预留路由与布局。</p>
      </div>
    </div>
  )
}
