import { useMemo, useState, type ReactNode } from 'react'
import { Table, Text, View } from '@instructure/ui'
import { ISearch, ISliders, IPlus } from './Icons'
import {
  type Config, type PageId, type Preferences, type ScopeId, type WorkspaceId,
  SCOPES, SERVICES, WORKSPACES, servicesFor, type ServiceId, quickActions,
  activityFor, openRequests, schoolsOffering, entitledServices, SCHOOL_IDS,
  DISTRICT_USERS, SCHOOL_COLOR, monthlyOrders, awaitingFulfilment, DIPLOMA_QUEUE,
  RECEIVE_TREND, RECEIVE_FACTS, serviceRollups, districtAttention, type ServiceRollup
} from './model'
import WhereYouStart from './WhereYouStart'

type Props = {
  workspace: WorkspaceId
  page: PageId
  scope: ScopeId | null
  config: Config
  prefs: Preferences
  onPrefs: (p: Preferences) => void
  onDirty: () => void
  onDrill: (scope: ScopeId, workspace: WorkspaceId) => void
}

function Card({
  title,
  sub,
  children
}: {
  title?: string
  sub?: string
  children: ReactNode
}) {
  return (
    <section className="card">
      {title && (
        <div className="card__head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 className="card__title">{title}</h2>
            {sub && <p className="card__sub">{sub}</p>}
          </div>
        </div>
      )}
      {children}
    </section>
  )
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric">
      <div className="metric__value">{value}</div>
      <div className="metric__label">{label}</div>
    </div>
  )
}

function ScopedTable({ scope, service }: { scope: ScopeId; service: ServiceId }) {
  const { head, rows, caption } = activityFor(scope, service)

  if (rows.length === 0) {
    return (
      <p style={{ margin: 0, fontSize: 14, color: 'var(--text-mutedcolor)' }}>
        No school in this district runs {SERVICES[service].name} yet.
      </p>
    )
  }

  return (
    <Table caption={caption}>
      <Table.Head>
        <Table.Row>
          {head.map((h) => (
            <Table.ColHeader key={h} id={h}>
              {h}
            </Table.ColHeader>
          ))}
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {rows.map((r) => (
          <Table.Row key={r[0]}>
            {r.map((cell, i) => (
              <Table.Cell key={i}>{cell}</Table.Cell>
            ))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}

function SearchCard({ what, where, onDirty }: { what: string; where: string; onDirty: () => void }) {
  return (
    <Card title="Search" sub={`Find learners, credentials and orders across ${what}.`}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <label className="srch" style={{ flex: '1 1 320px' }}>
          <span className="visually-hidden">Search {what} in {where}</span>
          <ISearch size={18} />
          <input
            type="search"
            placeholder="Try a name, DOB or order ID"
            onChange={onDirty}
          />
        </label>
        <button type="button" className="btn btn--primary" onClick={onDirty}>
          Search
        </button>
        <button type="button" className="btn btn--tertiary" onClick={onDirty}>
          <ISliders size={18} /> Advanced options
        </button>
      </div>
    </Card>
  )
}

function WorkspaceCard({
  scope,
  service,
  onDirty
}: {
  scope: ScopeId
  service: ServiceId
  onDirty: () => void
}) {
  const rows = quickActions(scope, service)
  const district = SCOPES[scope].kind === 'district'
  const shown = district ? rows.slice(0, 1) : rows
  return (
    <Card
      title="Workspace"
      sub={
        district
          ? 'District level. Pick a school in the control above to act on individual records.'
          : undefined
      }
    >
      <div>
        {shown.map(({ label: t, detail: d, cta }, i) => {
          const kind = i === 0 ? 'primary' : 'secondary'
          return (
          <div
            key={t}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              flexWrap: 'wrap',
              padding: '16px 0',
              borderTop: i === 0 ? 'none' : '1px solid var(--nav-border-color)'
            }}
          >
            <div style={{ flex: '1 1 260px', minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 18, color: 'var(--heading-basecolor)' }}>{t}</div>
              <div style={{ fontSize: 14, color: 'var(--text-mutedcolor)' }}>{d}</div>
            </div>
            <button type="button" className={`btn btn--${kind}`} onClick={onDirty}>
              {kind === 'secondary' && <IPlus size={18} />} {cta}
            </button>
          </div>
          )
        })}
      </div>
    </Card>
  )
}

/** Ken's panel chrome: title, subtitle, overflow menu, body. */
function Panel({
  title,
  sub,
  children
}: {
  title: string
  sub?: string
  children: ReactNode
}) {
  return (
    <section className="panel">
      <header className="panel__header">
        <div className="panel__heading">
          <h2 className="panel__title">{title}</h2>
          {sub && <p className="panel__subtitle">{sub}</p>}
        </div>
        <div className="panel__header-right">
          <button className="panel__menu" aria-label={`More options for ${title}`}>
            <span aria-hidden="true">⋮</span>
          </button>
        </div>
      </header>
      <div className="panel__body">{children}</div>
    </section>
  )
}

function Foot({ label, onClick }: { label: string; onClick?: () => void }) {
  return (
    <div className="srol__foot">
      <span className="srol__foot-meta">Updated 2h ago</span>
      <button className="srol__foot-link" type="button" onClick={onClick}>
        {label} <span aria-hidden="true">→</span>
      </button>
    </div>
  )
}

function SchoolList({ r }: { r: ServiceRollup }) {
  const [open, setOpen] = useState(false)
  const everywhere = r.schools.length === r.offered
  return (
    <div className="svcc__cov">
      <button
        type="button"
        className="svcc__cov-btn"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <span aria-hidden="true" className={`svcc__chev${open ? ' svcc__chev--open' : ''}`}>
          ›
        </span>
        {everywhere
          ? `${r.offered} ${r.offered === 1 ? 'school' : 'schools'}`
          : `${r.schools.length} of ${r.offered} schools`}
      </button>
      {open && (
        <ul className="svcc__cov-list">
          {r.schools.map((id) => (
            <li key={id}>{SCOPES[id].name}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

/**
 * Exceptions first, and only exceptions. Ranked by how long the oldest item has
 * waited, because the counts belong to different services and are not
 * comparable to each other. Each row goes to the queue inside its service, not
 * to the service's front door -- the point is to land on the work.
 */
function AttentionBand({
  rows,
  onDrill
}: {
  rows: ServiceRollup[]
  onDrill: (scope: ScopeId, workspace: WorkspaceId) => void
}) {
  if (rows.length === 0) {
    return (
      <div className="att att--clear">
        <span className="att__clear-mark" aria-hidden="true">
          ✓
        </span>
        <div>
          <p className="att__clear-title">Nothing is waiting on you</p>
          <p className="att__clear-sub">
            Every service in this district is clear for the schools you have selected.
          </p>
        </div>
      </div>
    )
  }
  return (
    <ul className="att">
      {rows.map((r) => (
        <li className="att__row" key={r.id}>
          <span className="att__mark" aria-hidden="true" />
          <div className="att__body">
            <p className="att__phrase">{r.phrase}</p>
            <p className="att__meta">
              {r.name} · {r.schools.map((id) => SCOPES[id].name).join(', ')} · oldest has waited{' '}
              {r.waitingDays} days
            </p>
          </div>
          <button
            type="button"
            className="btn btn--secondary att__go"
            onClick={() => onDrill('district', r.id)}
          >
            Open<span className="visually-hidden"> {r.name}</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

/**
 * Every entitled service, so a district always sees its whole estate -- but
 * weighted, not enumerated. A service with work waiting is loud; a service with
 * nothing to do keeps its place and goes quiet. If both states looked the same
 * this would be the table again in a different shape.
 */
function ServiceCards({
  rows,
  onDrill
}: {
  rows: ServiceRollup[]
  onDrill: (scope: ScopeId, workspace: WorkspaceId) => void
}) {
  return (
    <ul className="svcc__grid">
      {rows.map((r) => (
        <li className={`svcc${r.attention ? ' svcc--due' : ''}`} key={r.id}>
          <p className="svcc__status">
            <span className="svcc__status-mark" aria-hidden="true" />
            {r.attention ? 'Needs attention' : 'All clear'}
          </p>
          <h3 className="svcc__h">
            <button type="button" className="svcc__title" onClick={() => onDrill('district', r.id)}>
              {r.name}
            </button>
          </h3>
          <p className="svcc__metric">
            <strong>{r.value}</strong> {r.label}
          </p>
          <SchoolList r={r} />
        </li>
      ))}
    </ul>
  )
}

function Crest({ id }: { id: ScopeId }) {
  return (
    <span className="srt__crest" aria-hidden="true">
      <span
        style={{
          display: 'block',
          width: 24,
          height: 24,
          borderRadius: 7,
          background: SCHOOL_COLOR[id] ?? '#64748b'
        }}
      />
    </span>
  )
}

/**
 * One row per school with a proportional bar. The bar is decorative — the
 * number beside it is the real value, so nothing depends on seeing the fill.
 */
function BarTable({
  caption,
  valueLabel,
  rows,
  extraCols
}: {
  caption: string
  valueLabel: string
  rows: { id: ScopeId; value: number; cells?: number[] }[]
  extraCols?: string[]
}) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  const total = rows.reduce((n, r) => n + r.value, 0)
  const colTotals = (extraCols ?? []).map((_, i) =>
    rows.reduce((n, r) => n + (r.cells?.[i] ?? 0), 0)
  )
  return (
    <table className="srt">
      <caption className="srt__caption">{caption}</caption>
      <colgroup>
        <col className="srt__col-school" />
        {(extraCols ?? []).map((c) => (
          <col className="srt__col-num" key={c} />
        ))}
        <col className="srt__col-bar" />
      </colgroup>
      <thead>
        <tr>
          <th scope="col">School</th>
          {(extraCols ?? []).map((c) => (
            <th scope="col" className="srt__num" key={c}>
              {c}
            </th>
          ))}
          <th scope="col">{valueLabel}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.id}>
            <th scope="row">
              <span className="srt__school">
                <Crest id={r.id} />
                <span className="srt__school-text">
                  <span className="srt__school-name">{SCOPES[r.id].name}</span>
                </span>
              </span>
            </th>
            {(extraCols ?? []).map((c, i) => (
              <td className="srt__num" data-label={c} key={c}>
                {r.cells?.[i] ?? 0}
              </td>
            ))}
            <td className="srt__bar-cell" data-label={valueLabel}>
              <span className="srt__bar-wrap">
                <span className="srt__bar-track" aria-hidden="true">
                  <span
                    className="srt__bar-fill"
                    style={{
                      width: `${Math.round((r.value / max) * 100)}%`,
                      background: SCHOOL_COLOR[r.id] ?? '#64748b'
                    }}
                  />
                </span>
                <span className="srt__bar-value">{r.value}</span>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <th scope="row">Total</th>
          {(extraCols ?? []).map((c, i) => (
            <td className="srt__num" data-label={c} key={c}>
              {colTotals[i]}
            </td>
          ))}
          <td className="srt__bar-cell" data-label={valueLabel}>
            <span className="srt__bar-wrap">
              <span className="srt__bar-track srt__bar-track--empty" aria-hidden="true" />
              <span className="srt__bar-value">{total}</span>
            </span>
          </td>
        </tr>
      </tfoot>
    </table>
  )
}

/** Share of orders by school. Decorative — the table beside it carries the data. */
function Donut({ slices, total }: { slices: { id: ScopeId; value: number }[]; total: number }) {
  const r = 70
  const c = 2 * Math.PI * r
  let at = 0
  return (
    <svg width="186" height="186" viewBox="0 0 186 186" aria-hidden="true" focusable="false">
      <g transform="rotate(-90 93 93)">
        {slices.map((s) => {
          const frac = total ? s.value / total : 0
          const el = (
            <circle
              key={s.id}
              cx="93"
              cy="93"
              r={r}
              fill="none"
              stroke={SCHOOL_COLOR[s.id] ?? '#64748b'}
              strokeWidth="26"
              strokeDasharray={`${c * frac} ${c}`}
              strokeDashoffset={-c * at}
            />
          )
          at += frac
          return el
        })}
      </g>
      <text
        x="93"
        y="93"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="30"
        fontWeight="700"
        fill="var(--heading-basecolor)"
      >
        {total.toLocaleString()}
      </text>
    </svg>
  )
}

function Spark({ data }: { data: number[] }) {
  const w = 760
  const h = 110
  const max = Math.max(...data)
  const min = Math.min(...data)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 12) + 6
    const y = h - 10 - ((v - min) / Math.max(1, max - min)) * (h - 28)
    return [x, y] as const
  })
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true" focusable="false">
      <line x1="6" y1={h - 6} x2={w - 6} y2={h - 6} stroke="var(--nav-border-color)" />
      <polyline
        fill="none"
        stroke="#2a78d6"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={pts.map(([x, y]) => `${x},${y}`).join(' ')}
      />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="4.5" fill="#2a78d6" />
    </svg>
  )
}

/**
 * The district roll-up. A district runs several services at once and each one
 * pulls in a different set of schools, so this reports across all of them
 * before asking you to pick one. The schools filter is here because a roll-up
 * across every school is often not the question.
 */
function DistrictOverview({
  svcs,
  onDrill
}: {
  svcs: ServiceId[]
  onDrill: (scope: ScopeId, workspace: WorkspaceId) => void
}) {
  const [picked, setPicked] = useState<ScopeId[]>([...SCHOOL_IDS])
  const [openFilter, setOpenFilter] = useState(false)
  const [note, setNote] = useState('')
  const all = picked.length === SCHOOL_IDS.length

  function toggle(id: ScopeId) {
    const next = picked.includes(id) ? picked.filter((x) => x !== id) : [...picked, id]
    if (next.length === 0) {
      setNote('At least one school has to stay selected.')
      return
    }
    setPicked(next)
    setNote(
      next.length === SCHOOL_IDS.length
        ? `Showing all ${SCHOOL_IDS.length} schools.`
        : `Showing ${next.length} of ${SCHOOL_IDS.length} schools: ${next
            .map((x) => SCOPES[x].name)
            .join(', ')}.`
    )
  }

  const inView = (sv: ServiceId) => schoolsOffering(sv).filter((id) => picked.includes(id))

  const orderRows = useMemo(
    () =>
      inView('transcript')
        .map((id) => ({ id, value: monthlyOrders(id, 'transcript') }))
        .sort((a, b) => b.value - a.value),
    [picked]
  )
  const orderTotal = orderRows.reduce((n, r) => n + r.value, 0)

  const openRows = inView('transcript')
    .map((id) => ({ id, value: awaitingFulfilment(id, 'transcript') }))
    .sort((a, b) => b.value - a.value)
  const openTotal = openRows.reduce((n, r) => n + r.value, 0)

  const diplomaRows = inView('diploma')
    .map((id) => ({
      id,
      value: openRequests(id, 'diploma'),
      cells: [DIPLOMA_QUEUE[id]?.scheduled ?? 0, DIPLOMA_QUEUE[id]?.inProgress ?? 0]
    }))
    .sort((a, b) => b.value - a.value)
  const diplomaTotal = diplomaRows.reduce((n, r) => n + r.value, 0)

  const dualRows = inView('dualEnrollment')
    .map((id) => ({ id, value: Math.max(1, Math.round(openRequests(id, 'dualEnrollment') / 24)) }))
    .sort((a, b) => b.value - a.value)
  const dualTotal = dualRows.reduce((n, r) => n + r.value, 0)

  const receiveSchools = inView('receive')
  const servicesInUse = svcs.filter((sv) => inView(sv).length > 0).length
  const rollups = useMemo(() => serviceRollups(svcs, picked), [svcs, picked])
  const attention = useMemo(() => districtAttention(svcs, picked, 3), [svcs, picked])

  return (
    <div className="grid2">
      <div className="col-main">
        <div className="lc lc--dash">
          <div className="lc__group">
            <div className="lc__wrap">
              <button
                type="button"
                className="lc__btn"
                aria-expanded={openFilter}
                onClick={() => setOpenFilter(!openFilter)}
              >
                <span className="lc__btn-label">Schools</span>
                <span className="lc__btn-summary">
                  {all ? 'All' : `${picked.length} of ${SCHOOL_IDS.length}`}
                </span>
                <span aria-hidden="true">▾</span>
              </button>
              {openFilter && (
                <fieldset className="schfilter">
                  <legend className="visually-hidden">Which schools to include</legend>
                  {SCHOOL_IDS.map((id) => (
                    <label key={id} className="schfilter__chip">
                      <input
                        type="checkbox"
                        checked={picked.includes(id)}
                        onChange={() => toggle(id)}
                      />
                      <span>{SCOPES[id].name}</span>
                    </label>
                  ))}
                </fieldset>
              )}
            </div>
          </div>
          <p className="lc__count">Filters every panel on this page</p>
        </div>
        <div className="visually-hidden" role="status" data-dist-live>
          {note}
        </div>

        <Panel
          title="Needs your attention"
          sub={
            attention.length > 0
              ? `Longest waiting first, across ${rollups.length} services. Every service is listed below.`
              : 'Across every service this district runs'
          }
        >
          <AttentionBand rows={attention} onDrill={onDrill} />
        </Panel>

        <Panel
          title="Your services"
          sub={`${rollups.length} services · each one covers its own set of schools`}
        >
          <ServiceCards rows={rollups} onDrill={onDrill} />
        </Panel>

        <section className="ayd" aria-labelledby="ayd-greeting">
          <p className="ayd__greeting" id="ayd-greeting">
            <span className="ayd__spark" aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="url(#ayd-grad)">
                <path d="M10.2 4.8C13.1 10.5 13.1 10.5 18.8 13.4C13.1 16.3 13.1 16.3 10.2 22C7.3 16.3 7.3 16.3 1.6 13.4C7.3 10.5 7.3 10.5 10.2 4.8Z" />
                <path d="M18.6 1.7C19.9 4.3 19.9 4.3 22.5 5.6C19.9 6.9 19.9 6.9 18.6 9.5C17.3 6.9 17.3 6.9 14.7 5.6C17.3 4.3 17.3 4.3 18.6 1.7Z" />
              </svg>
            </span>
            <span className="ayd__greeting-text">Welcome back, Peter!</span>
          </p>
          <p className="ayd__sub">Ask anything about activity across your schools.</p>
          <svg width="0" height="0" aria-hidden="true" focusable="false">
            <defs>
              <linearGradient id="ayd-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#944fb3" />
                <stop offset="100%" stopColor="#027887" />
              </linearGradient>
            </defs>
          </svg>
          <form className="ayd__form" onSubmit={(e) => e.preventDefault()}>
            <button
              type="button"
              className="ayd__plus"
              aria-label="Add a file or a report for context"
            >
              <span aria-hidden="true">+</span>
            </button>
            <input
              className="ayd__input"
              id="ayd-prompt"
              placeholder="Enter a prompt"
              aria-label="Ask about activity across your schools"
            />
            <button type="submit" className="ayd__send" aria-label="Ask">
              <span aria-hidden="true">↑</span>
            </button>
          </form>
          <ul className="ayd__suggestions">
            {[
              'Which school has the most unfulfilled orders?',
              'How is order volume split across the network?',
              "Is anyone's access going unused?"
            ].map((q) => (
              <li key={q}>
                <button type="button" className="ayd__suggestion">
                  {q}
                </button>
              </li>
            ))}
          </ul>
        </section>

        <Panel title="Order fulfillment" sub="Transcript Services · This month">
          <div className="osum__body">
            <div className="osum__chart">
              <Donut slices={orderRows} total={orderTotal} />
              <p className="osum__chart-note">
                Orders this month, across the selected schools
              </p>
            </div>
            <table className="osum__table">
              <caption className="osum__caption">Transcript Services orders by school</caption>
              <thead>
                <tr>
                  <th scope="col">School</th>
                  <th scope="col" className="osum__num">
                    Orders
                  </th>
                  <th scope="col" className="osum__num">
                    Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {orderRows.map((r) => (
                  <tr key={r.id}>
                    <th scope="row" className="osum__school">
                      <span
                        className="osum__swatch"
                        aria-hidden="true"
                        style={{ background: SCHOOL_COLOR[r.id] }}
                      />
                      {SCOPES[r.id].name}
                    </th>
                    <td className="osum__num">{r.value.toLocaleString()}</td>
                    <td className="osum__num osum__share">
                      {`${Math.round((r.value / Math.max(1, orderTotal)) * 100)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  <td className="osum__num">{orderTotal.toLocaleString()}</td>
                  <td className="osum__num osum__share">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="osum__ai">
            <span className="osum__ai-spark" aria-hidden="true">
              ✦
            </span>
            This summary is powered by IgniteAI and reflects the latest activity.
          </p>
          <div className="osum__foot">
            <span className="osum__foot-meta">Updated 2h ago</span>
            <button
              className="osum__foot-link"
              type="button"
              onClick={() => onDrill('district', 'transcript')}
            >
              View Details <span aria-hidden="true">→</span>
            </button>
          </div>
        </Panel>

        <Panel title="Open orders" sub="Transcript Services · Awaiting fulfillment">
          <BarTable
            caption={`${openTotal} open orders across ${openRows.length} ${openRows.length === 1 ? 'school' : 'schools'}, most outstanding first.`}
            valueLabel="Open orders"
            rows={openRows}
          />
          <Foot label="View all orders" onClick={() => onDrill('district', 'transcript')} />
        </Panel>

        {diplomaRows.length > 0 && (
          <Panel title="Issue events" sub="Diploma Services · Queued and in progress">
            <BarTable
              caption={`${diplomaTotal} diplomas ready to issue across ${diplomaRows.length} ${diplomaRows.length === 1 ? 'school' : 'schools'}.`}
              valueLabel="Ready to issue"
              extraCols={['Scheduled', 'In progress']}
              rows={diplomaRows}
            />
            <Foot label="View issue events" onClick={() => onDrill('district', 'diploma')} />
          </Panel>
        )}

        {dualRows.length > 0 && (
          <Panel title="New applications" sub="Dual Enrollment · Awaiting review">
            <BarTable
              caption={`${dualTotal} applications awaiting review across ${dualRows.length} ${dualRows.length === 1 ? 'school' : 'schools'}.`}
              valueLabel="New applications"
              rows={dualRows}
            />
            <Foot label="Review applications" onClick={() => onDrill('district', 'dualEnrollment')} />
          </Panel>
        )}

        {receiveSchools.length > 0 && (
          <Panel
            title="Waiting to download"
            sub={`Receive · ${receiveSchools.length} ${receiveSchools.length === 1 ? 'school' : 'schools'}`}
          >
            <div className="srol__trend">
              <Spark data={RECEIVE_TREND} />
              <p className="srol__trend-note">
                Documents received per day, last 14 days. Between{' '}
                {Math.min(...RECEIVE_TREND)} and {Math.max(...RECEIVE_TREND)} a day, ending on{' '}
                {RECEIVE_TREND[RECEIVE_TREND.length - 1]}. The two dips are weekends.
              </p>
            </div>
            <div className="srol__stats">
              <div className="srol__stat">
                <span className="srol__stat-value">{RECEIVE_FACTS.toDownload}</span>
                <span className="srol__stat-label">Documents to download</span>
                <span className="srol__stat-hint">Received but not yet viewed or downloaded.</span>
                <button type="button" className="btn btn--secondary">
                  View documents
                </button>
              </div>
              <div className="srol__stat">
                <span className="srol__stat-value">{RECEIVE_FACTS.pendingZips}</span>
                <span className="srol__stat-label">Pending ZIP downloads</span>
                <span className="srol__stat-hint">Batched automatically by a workflow.</span>
                <button type="button" className="btn btn--secondary">
                  Download all
                </button>
              </div>
            </div>
            <Foot label="View Parchment Cloud" onClick={() => onDrill('district', 'receive')} />
          </Panel>
        )}
      </div>

      <div className="col-side">
        <Panel title="Your network">
          <dl className="adash__facts">
            <div className="adash__fact">
              <dt className="adash__fact-label">Schools</dt>
              <dd className="adash__fact-value">{picked.length}</dd>
            </div>
            <div className="adash__fact">
              <dt className="adash__fact-label">Services in use</dt>
              <dd className="adash__fact-value">{servicesInUse}</dd>
            </div>
          </dl>
          <p className="adash__note">Counted from the schools and services on your account.</p>
          <button type="button" className="btn btn--secondary">
            Manage schools
          </button>
        </Panel>

        <Panel title="District users">
          <p className="dusers__lead">
            <span className="dusers__count">{DISTRICT_USERS.total}</span>
            <span className="dusers__count-label">other people manage this district</span>
          </p>
          <ul className="dusers__list">
            <li className="dusers__row">
              <span className="dusers__icon dusers__icon--ok" aria-hidden="true">
                ✓
              </span>
              <span className="dusers__row-text">
                <span className="dusers__row-value">{`${DISTRICT_USERS.active} active`}</span>
                <span className="dusers__row-hint">Signed in within 30 days</span>
              </span>
            </li>
            <li className="dusers__row dusers__row--attention">
              <span className="dusers__icon dusers__icon--warn" aria-hidden="true">
                !
              </span>
              <span className="dusers__row-text">
                <span className="dusers__row-value">{`${DISTRICT_USERS.dormant} not signed in`}</span>
                <span className="dusers__row-hint">
                  {`No activity for ${DISTRICT_USERS.dormantDays} days. Worth reviewing.`}
                </span>
              </span>
            </li>
          </ul>
          <button type="button" className="btn btn--secondary">
            Manage users
          </button>
        </Panel>

      </div>
    </div>
  )
}

export default function Pages({
  workspace, page, scope, config, prefs, onPrefs, onDirty, onDrill
}: Props) {
  const ws = WORKSPACES[workspace]
  const label = ws.pages.find((p) => p.id === page)?.label ?? 'Dashboard'

  /* Account settings is account-level, so it is not a page inside any one
     service's rail. It was previously routed to whichever service happened to
     have a Settings item, which meant it went dead in the two services that do
     not have one — taking "Where you start" with it. */
  if (page === 'account') {
    return (
      <Card
        title="Preferences"
        sub="These follow you across every school and service, so they are set once rather than per school."
      >
        <WhereYouStart config={config} prefs={prefs} onChange={onPrefs} />
      </Card>
    )
  }

  /* Workspaces that are not tied to a school. The scope control still exists in
     the rail, it just has nothing to act on here, and the page says so. */
  if (!ws.scoped) {
    if (workspace === 'platform') {
      if (page === 'organization') {
        return (
          <Card title="Organization" sub="Districts, schools and how they roll up. Applies everywhere, not to one school.">
            <Text as="p" color="secondary">
              Platform settings sit above the school and service axes, so the control in the rail is
              greyed out here rather than hidden. Nothing you change on this page is scoped to a
              single school.
            </Text>
          </Card>
        )
      }
      if (page === 'users') {
        return (
          <Card title="Users" sub="Everyone with a sign-in, and what each of them can reach.">
            <Text as="p" color="secondary">
              A person's scope and services are granted here. That grant is what decides which
              options they see in the school and service control.
            </Text>
          </Card>
        )
      }
      if (page === 'settings') {
        return (
          <Card title="Platform settings" sub="Defaults that apply to every school and every service.">
            <Text as="p" color="secondary">
              Branding, authentication and retention live here. Service level settings stay inside
              each service so they can differ per school.
            </Text>
          </Card>
        )
      }
      return (
        <Card
          title="Overview"
          sub="Settings that sit above every school and service, so the scope control has nothing to act on here."
        >
          <div className="metrics">
            <Metric value="3" label="Schools" />
            <Metric value="7" label="Services in use" />
            <Metric value="48" label="People with a sign-in" />
          </div>
        </Card>
      )
    }
    if (page === 'settings') {
      return (
        <Card title="Settings" sub="Settings for your own Parchment account.">
          <Text as="p" color="secondary">
            Where you land when you sign in now lives in Account settings, reachable from your name
            at the top of the rail, so it is the same control from every service.
          </Text>
        </Card>
      )
    }
    return (
      <Card
        title={label}
        sub="Your own learner record. No school applies here, so the school half of the control is greyed out rather than hidden."
      >
        <div className="metrics">
          <Metric value="3" label="Credentials held" />
          <Metric value="1" label="Share in progress" />
          <Metric value={config.idVerification ? 'Verified' : 'Unverified'} label="Identity" />
        </div>
      </Card>
    )
  }

  if (!scope) return null

  /* The district runs several services at once, and each rolls up a different
     set of schools. One service's dashboard cannot answer "how is the district
     doing", so the overview reports across all of them and drills in. */
  if (workspace === 'overview') {
    const svcs = entitledServices(config)

    if (page === 'schools') {
      return (
        <div className="grid2">
          <div className="col-main">
            <Card
              title="Schools in this district"
              sub={`Every school you administer, and the services each one uses. ${SCHOOL_IDS.length} schools across ${svcs.length} services.`}
            >
              <Table caption="Schools in this district and the services each one uses">
                <Table.Head>
                  <Table.Row>
                    <Table.ColHeader id="sc-name">School</Table.ColHeader>
                    <Table.ColHeader id="sc-loc">Location</Table.ColHeader>
                    <Table.ColHeader id="sc-svc">Services</Table.ColHeader>
                    <Table.ColHeader id="sc-open">Open items</Table.ColHeader>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  {SCHOOL_IDS.map((id) => (
                    <Table.Row key={id}>
                      <Table.Cell>
                        <span className="schcell">
                          <span className="schcell__name">{SCOPES[id].name}</span>
                          <span className="schcell__meta">{SCOPES[id].detail}</span>
                        </span>
                      </Table.Cell>
                      <Table.Cell>{SCOPES[id].location}</Table.Cell>
                      <Table.Cell>
                        <span className="tagrow">
                          {SCOPES[id].services.map((sv) => (
                            <span className="tagpill" key={sv}>
                              {SERVICES[sv].name}
                            </span>
                          ))}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        {String(
                          SCOPES[id].services.reduce((n, sv) => n + openRequests(id, sv), 0)
                        )}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </Card>
          </div>
          <div className="col-side">
            <Card
              title="Add a school"
              sub="Connect another school to this district and choose which services it uses."
            >
              <button type="button" className="svccard__go">
                Add a school
              </button>
            </Card>
          </div>
        </div>
      )
    }

    if (page === 'settings') {
      return (
        <div className="grid2">
          <div className="col-main">
            <Card
              title="District settings"
              sub="Settings that apply to the district as a whole. Anything service-specific lives inside that service."
            >
              <Table caption="District-level settings">
                <Table.Head>
                  <Table.Row>
                    <Table.ColHeader id="ds-name">Setting</Table.ColHeader>
                    <Table.ColHeader id="ds-val">Applies to</Table.ColHeader>
                  </Table.Row>
                </Table.Head>
                <Table.Body>
                  <Table.Row>
                    <Table.Cell>District name and branding</Table.Cell>
                    <Table.Cell>{`All ${SCHOOL_IDS.length} schools`}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Who can administer the district</Table.Cell>
                    <Table.Cell>{`${DISTRICT_USERS.total} people`}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Which services each school may use</Table.Cell>
                    <Table.Cell>{`${svcs.length} services`}</Table.Cell>
                  </Table.Row>
                  <Table.Row>
                    <Table.Cell>Single sign-on</Table.Cell>
                    <Table.Cell>{`All ${SCHOOL_IDS.length} schools`}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table>
            </Card>
          </div>
          <div className="col-side">
            <Card title="Not here" sub="">
              <Text as="p" color="secondary" size="small">
                Order rules, storefronts and fulfilment settings belong to a service, not the
                district. Open a service from All services to reach them.
              </Text>
            </Card>
          </div>
        </div>
      )
    }

    if (page === 'reports') {
      return (
        <Card
          title="Reports"
          sub="District-wide reporting. Pick a service to report on, or compare them side by side."
        >
          <Table caption="Open items by service across the district">
            <Table.Head>
              <Table.Row>
                <Table.ColHeader id="rp-svc">Service</Table.ColHeader>
                <Table.ColHeader id="rp-schools">Schools running it</Table.ColHeader>
                <Table.ColHeader id="rp-where">Where</Table.ColHeader>
                <Table.ColHeader id="rp-total">Open items</Table.ColHeader>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {svcs.map((sv) => {
                const run = schoolsOffering(sv)
                return (
                  <Table.Row key={sv}>
                    <Table.Cell>{SERVICES[sv].name}</Table.Cell>
                    <Table.Cell>{`${run.length} of ${SCHOOL_IDS.length}`}</Table.Cell>
                    <Table.Cell>{run.map((id) => SCOPES[id].name).join(', ')}</Table.Cell>
                    <Table.Cell>{String(openRequests('district', sv))}</Table.Cell>
                  </Table.Row>
                )
              })}
            </Table.Body>
          </Table>
          <Text as="p" color="secondary" size="small">
            Services do not roll up the same schools, so these totals cover different parts of
            the district. Open a service from All services to see it school by school.
          </Text>
        </Card>
      )
    }

    return <DistrictOverview svcs={svcs} onDrill={onDrill} />
  }

  const svc = SERVICES[workspace as ServiceId]
  const where = SCOPES[scope].name
  const district = SCOPES[scope].kind === 'district'
  const services = servicesFor(scope, config)
  const offering = schoolsOffering(workspace as ServiceId)

  if (page === 'settings') {
    return (
      <Card title={`${svc.name} settings`} sub={`These settings apply to ${where} only.`}>
        <Text as="p" color="secondary">
          Service settings for {svc.name} at {where} would appear here. They are scoped to this
          school, so changing the school in the control above changes what you are editing.
        </Text>
        <View as="div" margin="medium 0 0 0">
          <Text as="p" color="secondary" size="small">
            Looking for where you land when you sign in? That is a personal preference, not a
            setting for this school, so it lives in Account settings under your name.
          </Text>
        </View>
      </Card>
    )
  }

  const side = (
    <div className="col-side">
      <Card title="At a glance" sub={`${svc.name} at ${where}.`}>
        <div className="metrics">
          <Metric value={String(openRequests(scope, workspace as ServiceId))} label="Open items" />
          <Metric value={String(services.length)} label="Services here" />
          <Metric
            value={district ? `${offering.length} of 3` : '1'}
            label={district ? 'Schools running it' : 'School in scope'}
          />
        </div>
      </Card>

      <Card title={svc.name} sub={svc.blurb}>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--text-mutedcolor)' }}>
          {where} offers:
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {services.map((id) => (
            <span key={id} className={`tagpill${id === workspace ? ' tagpill--on' : ''}`}>
              {SERVICES[id].name}
            </span>
          ))}
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-mutedcolor)' }}>
          Each service has its own pages, so changing service changes the rail below the control.
        </p>
      </Card>
    </div>
  )

  if (page === 'dashboard') {
    return (
      <div className="grid2">
        <div className="col-main">
          <SearchCard what={svc.name} where={where} onDirty={onDirty} />
          <WorkspaceCard scope={scope} service={workspace as ServiceId} onDirty={onDirty} />
          <Card
            title={district ? `${svc.name} by school` : 'Recent activity'}
            sub={
              district
                ? offering.length === 3
                  ? 'Every school in the district runs this service.'
                  : `${offering.length} of 3 schools run this service. The rest are not counted above.`
                : `Latest ${svc.name.toLowerCase()} activity in ${where}.`
            }
          >
            <ScopedTable scope={scope} service={workspace as ServiceId} />
          </Card>
        </div>
        {side}
      </div>
    )
  }

  return (
    <div className="grid2">
      <div className="col-main">
        <SearchCard what={label} where={where} onDirty={onDirty} />
        <Card title={label} sub={`${label} in ${svc.name}, scoped to ${where}.`}>
          <ScopedTable scope={scope} service={workspace as ServiceId} />
        </Card>
      </div>
      {side}
    </div>
  )
}
