export function PageHeader({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  return (
    <div className="space-y-1.5">
      <h1 className="text-balance text-2xl font-bold tracking-tight text-foreground lg:text-3xl">{title}</h1>
      {description ? <p className="max-w-2xl text-pretty text-sm text-muted-foreground">{description}</p> : null}
    </div>
  )
}
