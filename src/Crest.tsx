type Props = { size?: number; title?: string }

/** Navy shield crest with a mortarboard, matching the institution mark in the existing prototype. */
export default function Crest({ size = 40, title }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      focusable="false"
    >
      <path
        d="M20 2.5 4.5 7.6v13.1c0 8 6.4 14.4 15.5 17.8 9.1-3.4 15.5-9.8 15.5-17.8V7.6L20 2.5Z"
        fill="#1d354f"
      />
      <path d="M20 13.2 10.4 17 20 20.9 29.6 17 20 13.2Z" fill="#f5c84b" />
      <path
        d="M14 19.4v4.1c0 1.9 2.7 3.2 6 3.2s6-1.3 6-3.2v-4.1l-6 2.4-6-2.4Z"
        fill="#f5c84b"
      />
      <path d="M29.6 17v5.1" stroke="#f5c84b" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}
