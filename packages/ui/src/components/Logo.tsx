interface LogoProps {
  size?: number
  showName?: boolean
  className?: string
}

export function Logo({ size = 32, showName = false, className }: LogoProps) {
  return (
    <div className={`flex items-center gap-2${className ? ` ${className}` : ''}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 120"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="LoopERP logo"
      >
        <rect x="10" y="10" width="100" height="100" rx="20" fill="#1A1F36" />
        <path
          d="M30 75 C40 40, 60 40, 70 75 S100 100, 95 55"
          stroke="#14B8A6"
          strokeWidth="4"
          fill="none"
        />
        <circle cx="95" cy="55" r="4" fill="#EADBC8" />
      </svg>
      {showName && (
        <span
          style={{ fontSize: Math.round(size * 0.5), lineHeight: 1 }}
          className="font-semibold text-gray-900 tracking-tight"
        >
          LoopERP
        </span>
      )}
    </div>
  )
}
