import { useMemo, useState, type ReactNode } from 'react'
import { Table, Text, View } from '@instructure/ui'
import { ISearch, ISliders, IPlus } from './Icons'
import {
  type Config, type PageId, type Preferences, type ScopeId, type WorkspaceId,
  SCOPES, SERVICES, WORKSPACES, servicesFor, type ServiceId, quickActions,
  activityFor, openRequests, schoolsOffering, entitledServices, SCHOOL_IDS,
  DISTRICT_USERS
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

/**
 * The district roll-up. A district runs several services at once and each one
 * pulls in a different set of schools, so this answers "how is the district
 * doing" before asking you to pick a service. The schools filter is here
 * because a roll-up across every school is often not the question: a district
 * admin usually wants two of them side by side.
 */
function DistrictOverview({
  svcs,
  onDrill
}: {
  svcs: ServiceId[]
  onDrill: (scope: ScopeId, workspace: WorkspaceId) => void
}) {
  const [picked, setPicked] = useState<ScopeId[]>([...SCHOOL_IDS])
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

  // Each service only counts the picked schools that actually run it, so a
  // service nobody selected drops to zero rather than silently showing the
  // district total.
  const rows = useMemo(
    () =>
      svcs.map((sv) => {
        const run = schoolsOffering(sv)
        const inView = run.filter((id) => picked.includes(id))
        return {
          sv,
          run,
          inView,
          open: inView.reduce((n, id) => n + openRequests(id, sv), 0)
        }
      }),
    [svcs, picked]
  )

  const total = rows.reduce((n, r) => n + r.open, 0)
  const live = rows.filter((r) => r.inView.length > 0).length

  return (
    <div className="grid2">
      <div className="col-main">
        <Card
          title="All services"
          sub="Every service the district runs, with the schools rolled up to each one. Open a service to work in it."
        >
          <fieldset className="schfilter">
            <legend className="schfilter__legend">Schools</legend>
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
            <span className="schfilter__count">
              {all ? `All ${SCHOOL_IDS.length} schools` : `${picked.length} of ${SCHOOL_IDS.length}`}
            </span>
          </fieldset>
          <div className="visually-hidden" role="status" data-dist-live>
            {note}
          </div>

          <div className="svcgrid">
            {rows.map(({ sv, run, inView, open }) => (
              <div
                className={`svccard${inView.length === 0 ? ' svccard--off' : ''}`}
                key={sv}
              >
                <div className="svccard__head">
                  <h3 className="svccard__name">{SERVICES[sv].name}</h3>
                  <span className="svccard__count">{open}</span>
                </div>
                <p className="svccard__meta">
                  {inView.length === 0
                    ? `Not run by ${picked.length === 1 ? 'that school' : 'any of the selected schools'}`
                    : run.length === SCHOOL_IDS.length && all
                      ? `All ${run.length} schools`
                      : `${inView.length} of ${picked.length} selected · ${inView
                          .map((id) => SCOPES[id].name)
                          .join(', ')}`}
                </p>
                <button
                  type="button"
                  className="svccard__go"
                  onClick={() => onDrill('district', sv)}
                >
                  Open {SERVICES[sv].name}
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="col-side">
        <Card
          title="Your network"
          sub={all ? 'Bambusa District, across every service.' : 'Limited to the schools you selected.'}
        >
          <div className="metrics">
            <Metric value={String(total)} label="Open items" />
            <Metric value={String(live)} label="Services in use" />
            <Metric value={String(picked.length)} label="Schools" />
          </div>
        </Card>

        <Card title="District users" sub={`${DISTRICT_USERS.total} other people manage this district.`}>
          <ul className="dusers">
            <li className="dusers__row">
              <span className="dusers__n">{DISTRICT_USERS.active}</span>
              <span className="dusers__t">
                active
                <span className="dusers__s">Signed in within 30 days</span>
              </span>
            </li>
            <li className="dusers__row dusers__row--warn">
              <span className="dusers__n">{DISTRICT_USERS.dormant}</span>
              <span className="dusers__t">
                not signed in
                <span className="dusers__s">
                  {`No activity for ${DISTRICT_USERS.dormantDays} days. Worth reviewing.`}
                </span>
              </span>
            </li>
          </ul>
        </Card>

        <Card title="Why this page exists" sub="">
          <Text as="p" color="secondary" size="small">
            A district rarely runs one service. Landing you inside one of them would hide the
            other {svcs.length - 1} and make the district look smaller than it is. This page is
            the district, and each card drills into a service with the district still selected.
          </Text>
        </Card>
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
