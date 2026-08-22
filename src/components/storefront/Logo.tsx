export function Logo({ className = 'h-9 w-auto' }: { className?: string }) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white font-heading text-lg font-bold shrink-0">
        M
      </span>
      <span className="font-heading text-xl font-bold text-ink-900 leading-none tracking-tight">
        Milano<span className="text-primary">.</span>
      </span>
    </div>
  );
}
