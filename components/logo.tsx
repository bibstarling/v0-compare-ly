export function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 88 88"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Left bar: Primary color */}
      <rect x="28" y="20" width="12" height="48" rx="6" className="fill-primary" />
      {/* Right bar: Accent/secondary color */}
      <rect x="48" y="20" width="12" height="48" rx="6" className="fill-accent" />
    </svg>
  )
}
