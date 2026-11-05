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
  <S {...p} strokeWidth={1.8}>
    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
  </S>
)

export const IMaximize = (p: P) => (
  <S {...p} strokeWidth={1.8}>
    <path d="m15 15 6 6" />
    <path d="m15 9 6-6" />
    <path d="M21 16v5h-5" />
    <path d="M21 8V3h-5" />
    <path d="M3 16v5h5" />
    <path d="m3 21 6-6" />
    <path d="M3 8V3h5" />
    <path d="M9 9 3 3" />
  </S>
)

/**
 * Adam's AI mark: a filled four-point star with a smaller one riding its top
 * right. It is filled rather than stroked, so it holds its weight beside the
 * stroked bell and expand icons instead of disappearing between them.
 */
export const ISparkle = (p: P) => (
  <S {...p} stroke="none">
    <path
      d="M11.0621 2.53451C11.3843 1.66389 12.6157 1.66389 12.9379 2.53451L15.0815 8.32767C15.1828 8.60139 15.3986 8.8172 15.6723 8.91848L21.4655 11.0621C22.3361 11.3843 22.3361 12.6157 21.4655 12.9379L15.6723 15.0815C15.3986 15.1828 15.1828 15.3986 15.0815 15.6723L12.9379 21.4655C12.6157 22.3361 11.3843 22.3361 11.0621 21.4655L8.91849 15.6723C8.8172 15.3986 8.60139 15.1828 8.32767 15.0815L2.53451 12.9379C1.66389 12.6157 1.66389 11.3843 2.53451 11.0621L8.32767 8.91849C8.60139 8.8172 8.8172 8.60139 8.91848 8.32767L11.0621 2.53451Z"
      fill="currentColor"
    />
    <path
      d="M19.5311 1.26725C19.6922 0.831943 20.3078 0.831944 20.4689 1.26725L21.0804 2.91964L22.7327 3.53107C23.1681 3.69215 23.1681 4.30785 22.7327 4.46893L21.0804 5.08036L20.4689 6.73275C20.3078 7.16806 19.6922 7.16806 19.5311 6.73275L18.9196 5.08036L17.2673 4.46893C16.8319 4.30785 16.8319 3.69215 17.2673 3.53107L18.9196 2.91964L19.5311 1.26725Z"
      fill="currentColor"
    />
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

export const IMoon = (p: P) => (
  <S {...p}>
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </S>
)

export const ITextSize = (p: P) => (
  <S {...p}>
    <path d="M3 18 7.5 7l4.5 11M4.4 14.5h6.2" />
    <path d="M14 18l3-7.5 3 7.5M14.9 15.6h4.2" />
  </S>
)

export const IContrast = (p: P) => (
  <S {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 3a9 9 0 0 1 0 18Z" fill="currentColor" stroke="none" />
  </S>
)

export const IX = (p: P) => (
  <S {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </S>
)

export const IWarning = (p: P) => (
  <svg width={p.size ?? 16} height={p.size ?? 16} viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
    <path d="M12 3 4.5 6v5.5c0 4.2 3.1 7.8 7.5 9 4.4-1.2 7.5-4.8 7.5-9V6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    <path d="M12 8.2v4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 15.4h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
)

export const IChevronsLeft = (p: P) => (
  <svg width={p.size ?? 20} height={p.size ?? 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="m11 17-5-5 5-5" />
    <path d="m18 17-5-5 5-5" />
  </svg>
)
