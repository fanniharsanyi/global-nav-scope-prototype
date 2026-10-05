import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TOUR_STEPS, type TourStep } from './model'

const PAD = 10
const GAP = 12
const POP = 330

type Box = {
  top: number
  left: number
  width: number
  height: number
  containerWidth: number
  containerHeight: number
}

/** Spotlight walkthrough shown once to new users.
 *  Skips any step whose target is not on screen, so it degrades rather than
 *  pointing at nothing. */
export default function Tour({ onDone }: { onDone: () => void }) {
  const [steps, setSteps] = useState<TourStep[] | null>(null)
  const [i, setI] = useState(0)
  const [box, setBox] = useState<Box | null>(null)
  const [place, setPlace] = useState<'below' | 'above' | 'beside'>('below')
  const [popH, setPopH] = useState(0)

  const root = useRef<HTMLDivElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  const restore = useRef<HTMLElement | null>(null)
  const focused = useRef(-1)

  const step = steps?.[i]

  // Targets only exist after React commits, so the filter cannot run during
  // render -- it would find nothing and close the tour immediately.
  useLayoutEffect(() => {
    const found = TOUR_STEPS.filter((s) => document.querySelector(s.target))
    setSteps(found)
    if (found.length === 0) onDone()
  }, [onDone])

  // Remember where focus was, so dismissing the tour does not strand it on
  // an element that is about to be unmounted.
  useEffect(() => {
    restore.current = document.activeElement as HTMLElement | null
    return () => restore.current?.focus?.()
  }, [])

  const measure = useCallback(() => {
    const r = root.current
    if (!r || !step) return
    const el = document.querySelector(step.target)
    if (!el) return
    const t = el.getBoundingClientRect()
    const c = r.getBoundingClientRect()
    setBox({
      top: t.top - c.top,
      left: t.left - c.left,
      width: t.width,
      height: t.height,
      containerWidth: c.width,
      containerHeight: c.height
    })
  }, [step])

  // Bring the target into view before measuring, or the spotlight can land
  // off-screen on a long page.
  useLayoutEffect(() => {
    const el = step && document.querySelector(step.target)
    el?.scrollIntoView({ block: 'center', behavior: 'auto' })
    measure()
  }, [measure, step])

  useEffect(() => {
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
    }
  }, [measure])

  // The popover only mounts once the target has been measured, so focus has to
  // wait for it -- and must not be stolen back on every re-measure.
  useEffect(() => {
    if (!pop.current || focused.current === i) return
    focused.current = i
    pop.current.focus()
  }, [i, box])

  // aria-modal only tells the truth if focus is actually trapped.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDone()
        return
      }
      if (e.key !== 'Tab' || !pop.current) return
      const f = pop.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])'
      )
      if (f.length === 0) return
      const first = f[0]
      const last = f[f.length - 1]
      const here = document.activeElement
      if (!e.shiftKey && (here === last || here === pop.current)) {
        e.preventDefault()
        first.focus()
      } else if (e.shiftKey && (here === first || here === pop.current)) {
        e.preventDefault()
        last.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onDone])

  // A tall target -- the nav rail -- leaves room neither below nor above, so
  // there has to be a third placement or the popover clips off-screen.
  useLayoutEffect(() => {
    if (!box || !pop.current) return
    const h = pop.current.offsetHeight
    setPopH(h)
    if (box.top + box.height + PAD + GAP + h <= box.containerHeight - GAP) setPlace('below')
    else if (box.top - PAD - GAP - h >= GAP) setPlace('above')
    else setPlace('beside')
  }, [box, i])

  if (!steps || steps.length === 0 || !step) return null

  const hole = box && {
    top: box.top - PAD,
    left: box.left - PAD,
    width: box.width + PAD * 2,
    height: box.height + PAD * 2
  }

  let left = 0
  let top = 0
  let arrow = POP / 2
  if (box) {
    if (place === 'beside') {
      left = Math.min(box.left + box.width + PAD + GAP, box.containerWidth - POP - GAP)
      top = Math.max(GAP, Math.min(box.top, box.containerHeight - popH - GAP))
    } else {
      left = Math.min(
        Math.max(GAP, box.left + box.width - POP),
        Math.max(GAP, box.containerWidth - POP - GAP)
      )
      arrow = Math.min(Math.max(18, box.left + box.width / 2 - left), POP - 18)
      top =
        place === 'above'
          ? box.top - PAD - GAP - popH
          : box.top + box.height + PAD + GAP
    }
  }

  const last = i === steps.length - 1

  return (
    <div className="tour" ref={root}>
      <div className="tour__blocker" />
      {hole && <div className="tour__hole" style={hole} />}
      {box && (
        <div
          ref={pop}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-labelledby="tour-title"
          aria-describedby="tour-body"
          className={`tour__pop tour__pop--${place}`}
          style={{ left, top, width: POP }}
        >
          {place !== 'beside' && (
            <span className="tour__arrow" style={{ left: arrow }} aria-hidden="true" />
          )}
          <div className="tour__head">
            <h2 className="tour__title" id="tour-title">
              {step.title}
            </h2>
            <button
              type="button"
              className="tour__close"
              aria-label="Close the walkthrough"
              onClick={onDone}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
          <p className="tour__body" id="tour-body">
            {step.body}
          </p>
          <div className="tour__foot">
            <span className="tour__count">
              Step {i + 1} of {steps.length}
            </span>
            <div className="tour__actions">
              {i > 0 && (
                <button type="button" className="tour__back" onClick={() => setI((n) => n - 1)}>
                  Back
                </button>
              )}
              <button
                type="button"
                className="btn btn--primary"
                onClick={() => (last ? onDone() : setI((n) => n + 1))}
              >
                {last ? 'Got it' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
