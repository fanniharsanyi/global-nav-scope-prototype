import type { ReactNode } from 'react'
import { Table } from '@instructure/ui'
import { ISearch, ISliders, IPlus } from './Icons'
import {
  type Config, type PageId, type Preferences, type ScopeId, type WorkspaceId,
  SCOPES, SERVICES, WORKSPACES, servicesFor, type ServiceId, quickActions,
  activityFor, openRequests, schoolsOffering
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

export default function Pages({
  workspace, page, scope, config, prefs, onPrefs, onDirty
}: Props) {
  const ws = WORKSPACES[workspace]
  const label = ws.pages.find((p) => p.id === page)?.label ?? 'Dashboard'

  /* Workspaces that are not tied to a school. The scope control still exists in
     the rail, it just has nothing to act on here, and the page says so. */
  if (!ws.scoped) {
    if (page === 'settings') {
      return (
        <Card title="Settings" sub="Your preferences, including where you land when you sign in.">
          <WhereYouStart config={config} prefs={prefs} onChange={onPrefs} />
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

  const svc = SERVICES[workspace as ServiceId]
  const where = SCOPES[scope].name
  const district = SCOPES[scope].kind === 'district'
  const services = servicesFor(scope, config)
  const offering = schoolsOffering(workspace as ServiceId)

  if (page === 'settings') {
    return (
      <Card title={`${svc.name} settings`} sub={`These settings apply to ${where} only.`}>
        <WhereYouStart config={config} prefs={prefs} onChange={onPrefs} />
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
