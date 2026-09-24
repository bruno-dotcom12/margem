export function PrecoMono({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <span className={`font-mono tabular-nums ${className}`}>{children}</span>
}
