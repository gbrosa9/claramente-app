import { HTMLAttributes } from 'react'

interface ClaraLogoProps extends HTMLAttributes<SVGSVGElement> {}

export function ClaraLogo({ className, ...props }: ClaraLogoProps) {
  return (
    <svg
      viewBox="0 0 120 120"
      role="img"
      aria-labelledby="clara-logo"
      className={className}
      {...props}
    >
      <title id="clara-logo">ClaraMENTE</title>
      <defs>
        <linearGradient id="clara-gradient" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#9333ea" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#clara-gradient)" />
      <path d="M45 30c-11 7-17 18-17 30s6 23 17 30c11 7 26 7 37 0l-8-12c-7 4-16 4-22 0-6-4-9-10-9-18s3-14 9-18c6-4 15-4 22 0l8-12c-11-7-26-7-37 0z" fill="#fff" />
      <rect x="80" y="24" width="8" height="72" rx="4" fill="#fff" />
    </svg>
  )
}
