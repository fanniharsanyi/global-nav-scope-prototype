import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function S({ size = 20, children, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IDashboard = (p: P) => (
  <S {...p}>
    <rect x="3" y="3" width="7" height="9" rx="1" />
    <rect x="14" y="3" width="7" height="5" rx="1" />
    <rect x="14" y="12" width="7" height="9" rx="1" />
    <rect x="3" y="16" width="7" height="5" rx="1" />
  </S>
)

export const IFile = (p: P) => (
  <S {...p}>
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z" />
    <path d="M14 2v5h5" />
    <path d="M16 13H8M16 17H8M10 9H8" />
  </S>
)

export const IAward = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.5 12.9 17 22l-5-3-5 3 1.5-9.1" />
  </S>
)

export const IUsers = (p: P) => (
  <S {...p}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
  </S>
)

export const IInbox = (p: P) => (
  <S {...p}>
    <path d="M22 12h-6l-2 3h-4l-2-3H2" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
  </S>
)

export const IHelp = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <path d="M12 17h.01" />
  </S>
)

export const IUser = (p: P) => (
  <S {...p}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </S>
)

export const ISettings = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </S>
)

export const IBell = (p: P) => (
  <S {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </S>
)

export const IMaximize = (p: P) => (
  <S {...p}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
  </S>
)

export const IGrid = (p: P) => (
  <S {...p} strokeWidth={2.4}>
    <path d="M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01" />
  </S>
)

export const IUpDown = (p: P) => (
  <S {...p}>
    <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
  </S>
)

export const IPanelClose = (p: P) => (
  <S {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 3v18m7-3-3-3 3-3" />
  </S>
)

export const ISearch = (p: P) => (
  <S {...p}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </S>
)

export const ISliders = (p: P) => (
  <S {...p}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </S>
)

export const ILogOut = (p: P) => (
  <S {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5M21 12H9" />
  </S>
)

export const IChevronRight = (p: P) => (
  <S {...p}>
    <path d="m9 18 6-6-6-6" />
  </S>
)

export const IPlus = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v8M8 12h8" />
  </S>
)

export const ICheck = (p: P) => (
  <S {...p}>
    <path d="M20 6 9 17l-5-5" />
  </S>
)

export const IChart = (p: P) => (
  <S {...p}>
    <path d="M3 3v18h18" />
    <path d="M7 15v3M12 10v8M17 6v12" />
  </S>
)

export const IBook = (p: P) => (
  <S {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" />
    <path d="M4 19h15" />
  </S>
)

export const ICalendar = (p: P) => (
  <S {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </S>
)

export const IBuilding = (p: P) => (
  <S {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
  </S>
)

export const ISwap = (p: P) => (
  <S {...p}>
    <path d="M7 4 3 8l4 4" />
    <path d="M3 8h13a4 4 0 0 1 0 8h-1" />
  </S>
)

export const IExternal = (p: P) => (
  <S {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-8 8" />
    <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </S>
)

/** Canvas brand mark: ring of dots. Filled, not stroked. */
export const ICanvas = ({ size = 20, ...rest }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
    <circle cx="12" cy="12" r="3.1" fill="currentColor" />
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2
      return (
        <circle
          key={i}
          cx={12 + 7.6 * Math.cos(a)}
          cy={12 + 7.6 * Math.sin(a)}
          r={1.8}
          fill="currentColor"
        />
      )
    })}
  </svg>
)

/** Mastery brand mark: scattered dot cluster. */
export const IMastery = ({ size = 20, ...rest }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
    {[
      [5, 14, 2.3],
      [10, 9.5, 2.1],
      [15.5, 13.5, 2.4],
      [19.5, 9, 1.9],
      [8, 17.5, 1.7],
      [13.5, 18, 1.6],
    ].map(([cx, cy, r], i) => (
      <circle key={i} cx={cx} cy={cy} r={r} fill="currentColor" />
    ))}
  </svg>
)
