export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="relative flex h-8 w-8 items-center justify-center">
        <span className="absolute inset-0 rounded-[10px] bg-primary/20 blur-md" aria-hidden />
        <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-primary to-secondary ring-1 ring-inset ring-white/20">
          {/* Red card mark */}
          <span className="h-3.5 w-2.5 rounded-[3px] bg-[var(--danger)] shadow-[0_0_10px_rgba(255,59,48,0.7)]" aria-hidden />
        </span>
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Red<span className="text-primary">Match</span>
      </span>
    </span>
  )
}
