export type ServiceId =
  | 'transcript'
  | 'diploma'
  | 'dualEnrollment'
  | 'receive'
  | 'send'
  | 'verify'
  | 'badges'

export const SERVICES: Record<ServiceId, { id: ServiceId; name: string; blurb: string }> = {
  transcript: {
    id: 'transcript',
    name: 'Transcript Services',
    blurb: 'Order, fulfil and track official transcript requests.'
  },
  diploma: {
    id: 'diploma',
    name: 'Diploma Services',
    blurb: 'Design, approve and issue diplomas and certificates.'
  },
  dualEnrollment: {
    id: 'dualEnrollment',
    name: 'Dual Enrollment',
    blurb: 'Manage concurrent enrolment agreements and rosters.'
  },
  receive: {
    id: 'receive',
    name: 'Receive',
    blurb: 'Review inbound documents from other institutions.'
  },
  send: {
    id: 'send',
    name: 'Send',
    blurb: 'Send credentials to employers, agencies and other schools.'
  },
  verify: {
    id: 'verify',
    name: 'Credential Verification',
    blurb: 'Answer third-party verification requests for degrees and enrolment.'
  },
  badges: {
    id: 'badges',
    name: 'Badges & Certificates',
    blurb: 'Issue digital badges and micro-credentials.'
  }
}

export type ScopeId = 'district' | 'bambusa' | 'panda' | 'meridian'

export type Scope = {
  id: ScopeId
  name: string
  kind: 'district' | 'school'
  detail: string
  location: string
  services: ServiceId[]
}

/**
 * Entitlement is granted per school, but it is *read* service first.
 *
 * The platform identifies the service a user is entitled to, and the schools
 * follow from it. That is a constraint, not a preference, so the control asks
 * for service first and derives the school list from `schoolsOffering`. This
 * table stays school-keyed because that is the shape the grant actually has;
 * everything the UI shows is derived from it in the service -> schools
 * direction.
 */
export const SCOPES: Record<ScopeId, Scope> = {
  district: {
    id: 'district',
    name: 'Bambusa District',
    kind: 'district',
    detail: '3 schools · Denver, Colorado',
    location: 'Denver, Colorado',
    // Filled below from the union of the schools, so a district can never
    // claim a service none of its schools actually run.
    services: []
  },
  bambusa: {
    id: 'bambusa',
    name: 'Bambusa University',
    kind: 'school',
    detail: '4-year private · 18,400 learners',
    location: 'Denver, Colorado',
    services: ['transcript', 'diploma', 'dualEnrollment', 'receive', 'send', 'verify']
  },
  panda: {
    id: 'panda',
    name: 'Panda High School',
    kind: 'school',
    detail: 'Secondary · 1,260 learners',
    location: 'Portland, Oregon',
    services: ['transcript', 'diploma', 'receive', 'badges']
  },
  meridian: {
    id: 'meridian',
    name: 'Meridian Community College',
    kind: 'school',
    detail: '2-year public · 9,700 learners',
    location: 'Tempe, Arizona',
    services: ['transcript', 'dualEnrollment', 'receive', 'send', 'badges']
  }
}

export const SCHOOL_IDS_INIT = ['bambusa', 'panda', 'meridian'] as const
SCOPES.district.services = [...new Set(
  SCHOOL_IDS_INIT.flatMap((id) => SCOPES[id].services)
)]

export type Config = {
  shape: 'both' | 'adminOnly' | 'learnerOnly'
  districtAdmin: boolean
  multiSchool: boolean
  multiService: boolean
  hasCanvas: boolean
  hasMastery: boolean
  idVerification: boolean
}

export const DEFAULT_CONFIG: Config = {
  shape: 'both',
  districtAdmin: false,
  multiSchool: true,
  multiService: true,
  hasCanvas: false,
  hasMastery: false,
  idVerification: true
}

export const isAdmin = (c: Config) => c.shape !== 'learnerOnly'
export const isLearner = (c: Config) => c.shape !== 'adminOnly'

export function availableScopes(c: Config): ScopeId[] {
  if (!isAdmin(c)) return []
  if (c.districtAdmin) return ['district', 'bambusa', 'panda', 'meridian']
  if (c.multiSchool) return ['bambusa', 'panda', 'meridian']
  return ['bambusa']
}

export function servicesFor(scope: ScopeId | null, c: Config): ServiceId[] {
  if (!scope || !isAdmin(c)) return []
  const all = SCOPES[scope].services
  return c.multiService ? all : all.slice(0, 1)
}

export type SchoolId = Exclude<ScopeId, 'district'>
export const SCHOOL_IDS: SchoolId[] = ['bambusa', 'panda', 'meridian']

/** Which schools in the district actually run a given service. */
export const schoolsOffering = (s: ServiceId): SchoolId[] =>
  SCHOOL_IDS.filter((id) => SCOPES[id].services.includes(s))

/**
 * Every service this sign-in can reach, in rail order. This is the top of the
 * hierarchy: the school list is derived from whichever of these is chosen.
 */
export function entitledServices(c: Config): ServiceId[] {
  if (!isAdmin(c)) return []
  const seen = new Set<ServiceId>()
  for (const s of availableScopes(c)) for (const w of servicesFor(s, c)) seen.add(w)
  return SERVICE_ORDER.filter((id) => seen.has(id))
}

const SERVICE_ORDER: ServiceId[] = [
  'transcript', 'diploma', 'dualEnrollment', 'receive', 'send', 'verify', 'badges'
]

/**
 * Open work per school *per service*. The whole argument is that scope and
 * service are two independent axes, so the dashboard has to be indexed by
 * both -- a single number per school would quietly repeat the mistake the
 * nav is trying to fix.
 */
const VOLUME: Record<SchoolId, Partial<Record<ServiceId, number>>> = {
  bambusa: { transcript: 412, diploma: 96, dualEnrollment: 58, receive: 233, send: 174, verify: 61 },
  panda: { transcript: 126, diploma: 184, receive: 47, badges: 212 },
  meridian: { transcript: 88, dualEnrollment: 341, receive: 65, send: 29, badges: 73 }
}

export function openRequests(scope: ScopeId, service: ServiceId): number {
  if (scope === 'district')
    return schoolsOffering(service).reduce((n, id) => n + (VOLUME[id][service] ?? 0), 0)
  return VOLUME[scope as SchoolId][service] ?? 0
}

/**
 * Each service tracks a different kind of record, so the activity table has to
 * change its columns, not just its rows. Reusing "Learner / Submitted / Status"
 * for Receive and Send would be the same lie as reusing the request count.
 */
type ActivityShape = { who: string; when: string; subjects: string[]; statuses: string[] }

const ACTIVITY: Record<ServiceId, ActivityShape> = {
  transcript: {
    who: 'Learner',
    when: 'Submitted',
    subjects: ['2 days ago', '5 days ago', '1 week ago'],
    statuses: ['In review', 'Fulfilled', 'Awaiting payment']
  },
  diploma: {
    who: 'Learner',
    when: 'Ordered',
    subjects: ['Yesterday', '4 days ago', '2 weeks ago'],
    statuses: ['Awaiting approval', 'At the printer', 'Shipped']
  },
  dualEnrollment: {
    who: 'Learner',
    when: 'Course',
    subjects: ['ENG 101 · Composition', 'MATH 210 · Calculus II', 'BIO 140 · Human Biology'],
    statuses: ['Enrolled', 'Pending registrar', 'Waitlisted']
  },
  receive: {
    who: 'Sender',
    when: 'Received',
    subjects: ['3 hours ago', 'Yesterday', '3 days ago'],
    statuses: ['Matched to learner', 'Needs matching', 'In review']
  },
  send: {
    who: 'Recipient',
    when: 'Sent',
    subjects: ['1 hour ago', '2 days ago', '6 days ago'],
    statuses: ['Delivered', 'In transit', 'Bounced']
  },
  verify: {
    who: 'Requester',
    when: 'Requested',
    subjects: ['Today', '3 days ago', '1 week ago'],
    statuses: ['Verified', 'Awaiting learner consent', 'Expired']
  },
  badges: {
    who: 'Earner',
    when: 'Issued',
    subjects: ['Today', '5 days ago', '2 weeks ago'],
    statuses: ['Claimed', 'Issued, not claimed', 'Revoked']
  }
}

/** Names differ per school so changing scope visibly changes the rows too. */
const PEOPLE: Record<SchoolId, string[]> = {
  bambusa: ['Alex Rivera', 'Jordan Blake', 'Sam Okafor'],
  panda: ['Priya Raman', 'Devon Hart', 'Nina Castellanos'],
  meridian: ['Marcus Webb', 'Leah Nguyen', 'Tom Ferreira']
}

const ORGS: Record<SchoolId, string[]> = {
  bambusa: ['Denver South High', 'Holloway Registrar', 'Cascade Prep'],
  panda: ['Riverbend Middle', 'Parchment Exchange', 'St. Ive’s Academy'],
  meridian: ['Northgate High', 'Meridian Admissions', 'Lakeshore District']
}

export type ActivityTable = { head: [string, string, string]; rows: string[][]; caption: string }
export function activityFor(scope: ScopeId, service: ServiceId): ActivityTable {
  const a = ACTIVITY[service]

  if (scope === 'district') {
    const offering = schoolsOffering(service)
    return {
      head: ['School', 'Open items', 'Share of district'],
      caption: `${SERVICES[service].name} across the district`,
      rows: offering.map((id) => {
        const n = VOLUME[id][service] ?? 0
        const total = openRequests('district', service)
        return [SCOPES[id].name, String(n), `${Math.round((n / total) * 100)}%`]
      })
    }
  }

  const school = scope as SchoolId
  const names = a.who === 'Learner' || a.who === 'Earner' ? PEOPLE[school] : ORGS[school]
  return {
    head: [a.who, a.when, 'Status'],
    caption: `Recent ${SERVICES[service].name} activity at ${SCOPES[school].name}`,
    rows: names.map((n, i) => [n, a.subjects[i], a.statuses[i]])
  }
}

export type PageId = string

export type NavItem = { id: PageId; label: string; icon: string }

/**
 * Each workspace brings its own page set. This is the thing that rules out
 * flattening services into the rail: there are seven different sets here and
 * four of them contain a page called "Settings".
 */
export type WorkspaceId = ServiceId | 'overview' | 'learner' | 'platform'

export const WORKSPACES: Record<
  WorkspaceId,
  { id: WorkspaceId; name: string; scoped: boolean; icon: string; pages: NavItem[] }
> = {
  // A district runs several services, each rolling up a different set of
  // schools. Landing a district admin inside one arbitrary service hides the
  // other six, so district admins get a cross-service summary that drills in.
  overview: {
    id: 'overview',
    name: 'District overview',
    icon: 'chart',
    scoped: true,
    pages: [
      { id: 'dashboard', label: 'All services', icon: 'grid' },
      { id: 'reports', label: 'Reports', icon: 'chart' },
      { id: 'schools', label: 'Schools', icon: 'building' },
      { id: 'settings', label: 'Settings', icon: 'settings' }
    ]
  },
  transcript: {
    id: 'transcript',
    name: 'Transcript Services',
    icon: 'file',
    scoped: true,
    pages: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'cloud', label: 'Parchment Cloud', icon: 'file' },
      { id: 'orders', label: 'Orders', icon: 'inbox' },
      { id: 'reports', label: 'Reports', icon: 'chart' },
      { id: 'settings', label: 'Settings', icon: 'settings' }
    ]
  },
  diploma: {
    id: 'diploma',
    name: 'Diploma Services',
    icon: 'award',
    scoped: true,
    pages: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'orders', label: 'Orders', icon: 'inbox' },
      { id: 'learners', label: 'Learners', icon: 'users' },
      { id: 'settings', label: 'Settings', icon: 'settings' }
    ]
  },
  dualEnrollment: {
    id: 'dualEnrollment',
    name: 'Dual Enrollment',
    icon: 'book',
    scoped: true,
    pages: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'courses', label: 'Courses', icon: 'book' },
      { id: 'calendar', label: 'Calendar', icon: 'calendar' },
      { id: 'people', label: 'People', icon: 'users' }
    ]
  },
  receive: {
    id: 'receive',
    name: 'Receive',
    icon: 'inbox',
    scoped: true,
    pages: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'learners', label: 'Documents received', icon: 'inbox' },
      { id: 'settings', label: 'Settings', icon: 'settings' }
    ]
  },
  send: {
    id: 'send',
    name: 'Send',
    icon: 'external',
    scoped: true,
    pages: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'outbound', label: 'Outbound', icon: 'file' },
      { id: 'recipients', label: 'Recipients', icon: 'building' },
      { id: 'settings', label: 'Settings', icon: 'settings' }
    ]
  },
  verify: {
    id: 'verify',
    name: 'Credential Verification',
    icon: 'search',
    scoped: true,
    pages: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'requests', label: 'Requests', icon: 'inbox' },
      { id: 'reports', label: 'Reports', icon: 'chart' }
    ]
  },
  badges: {
    id: 'badges',
    name: 'Badges & Certificates',
    icon: 'check',
    scoped: true,
    pages: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'catalog', label: 'Badge catalog', icon: 'award' },
      { id: 'issued', label: 'Issued', icon: 'file' },
      { id: 'learners', label: 'Earners', icon: 'users' },
      { id: 'settings', label: 'Settings', icon: 'settings' }
    ]
  },
  learner: {
    id: 'learner',
    name: 'My Parchment account',
    icon: 'user',
    scoped: false,
    pages: [
      { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
      { id: 'records', label: 'My Records', icon: 'award' },
      { id: 'credentials', label: 'All Credentials', icon: 'file' },
      { id: 'orders', label: 'Orders', icon: 'inbox' },
      { id: 'settings', label: 'Settings', icon: 'settings' }
    ]
  },
  platform: {
    id: 'platform',
    name: 'Platform Settings',
    icon: 'settings',
    scoped: false,
    pages: [
      { id: 'dashboard', label: 'Overview', icon: 'dashboard' },
      { id: 'organization', label: 'Organization', icon: 'building' },
      { id: 'users', label: 'Users', icon: 'users' },
      { id: 'settings', label: 'Settings', icon: 'settings' }
    ]
  }
}

/** Workspaces the user can reach, in rail order, for a given scope. */
export function workspacesFor(scope: ScopeId | null, c: Config): WorkspaceId[] {
  const out: WorkspaceId[] = []
  if (scope === 'district' && c.districtAdmin && isAdmin(c)) out.push('overview')
  out.push(...servicesFor(scope, c))
  if (isLearner(c)) out.push('learner')
  return out
}

export function pagesFor(w: WorkspaceId): NavItem[] {
  return WORKSPACES[w].pages
}

/**
 * Preferences, taken from the original prototype's model rather than invented.
 *
 * `defaultSchoolByService` is its idea and it is the right one: the school you
 * want is a property of the service, not of you. Someone can run Transcript
 * Services for Bambusa and Dual Enrollment for Meridian, and no single "default
 * school" can express that.
 *
 * What changes here is where it lives and when it takes effect, not what it
 * stores.
 */
export type Preferences = {
  /** Which service you land in. The original calls this defaultDestinationId. */
  defaultService: WorkspaceId | null
  /** Which school each service opens on. Straight from the original. */
  defaultSchoolByService: Partial<Record<WorkspaceId, ScopeId>>
  /** Overrides the saved default with wherever you were last. */
  resumeLast: boolean
  /** Display preferences. These are the user's, so they follow the account. */
  ui: UiPreferences
}

export type UiPreferences = {
  dark: boolean
  dyslexic: boolean
  highContrast: boolean
}

export const DEFAULT_PREFERENCES: Preferences = {
  defaultService: null,
  defaultSchoolByService: {},
  resumeLast: true,
  ui: { dark: false, dyslexic: false, highContrast: false }
}

/**
 * The schools at which a given service is offered — the original's `Fn(u, e)`.
 *
 * It uses this to decide whether to show a default-school control at all, which
 * is a good instinct worth keeping: a service offered at one school has no
 * choice to make and should not ask.
 */
export function schoolsForService(ws: WorkspaceId, c: Config): ScopeId[] {
  if (!WORKSPACES[ws].scoped) return []
  // The overview is the district roll-up itself, so it has exactly one home.
  if (ws === 'overview') return c.districtAdmin && isAdmin(c) ? ['district'] : []
  return availableScopes(c).filter((s) => (servicesFor(s, c) as WorkspaceId[]).includes(ws))
}

/** Every service reachable by this user, across every school they can see. */
export function allServices(c: Config): WorkspaceId[] {
  const out: WorkspaceId[] = []
  if (c.districtAdmin && isAdmin(c)) out.push('overview')
  out.push(...entitledServices(c))
  if (isLearner(c)) out.push('learner')
  return out
}

/**
 * Where sign-in lands. Service first, then that service's school — the same
 * order the original resolves in, because the school only means something once
 * you know which service is asking.
 */
export function resolveStart(
  c: Config,
  p: Preferences
): { scope: ScopeId | null; workspace: WorkspaceId } {
  const scopes = availableScopes(c)
  const candidates = allServices(c)

  // Without a saved choice a district admin lands on the cross-service
  // summary rather than whichever service happens to sort first.
  const workspace =
    p.defaultService && candidates.includes(p.defaultService)
      ? p.defaultService
      : (candidates[0] ?? 'learner')

  if (!WORKSPACES[workspace].scoped) return { scope: scopes[0] ?? null, workspace }

  const homes = schoolsForService(workspace, c)
  const saved = p.defaultSchoolByService[workspace]
  const scope = saved && homes.includes(saved) ? saved : (homes[0] ?? scopes[0] ?? null)
  return { scope, workspace }
}

export const USER = {
  name: 'Peter Panda',
  email: 'peter_panda@bambusa-university.edu'
}

export function roleLabel(scope: ScopeId | null, _c: Config): string {
  if (!scope) return 'Learner'
  return SCOPES[scope].kind === 'district' ? 'District admin' : 'Admin'
}

/** Short summary of what a scope grants, shown on each row of the scope dialog. */
/**
 * The district dashboard reads across services, so every panel needs the same
 * school to look like the same school. One colour per school, used by the
 * donut, the bars and the swatches alike.
 */
export const SCHOOL_COLOR: Record<string, string> = {
  bambusa: '#2a78d6',
  panda: '#4a3aa7',
  meridian: '#1baf7a'
}

/** Orders placed this month. The open queue below is a slice of this, not a rival count. */
export function monthlyOrders(school: ScopeId, service: ServiceId): number {
  return (openRequests(school, service) || 0) * 5
}

/** How many of those are still sitting in the fulfilment queue. */
export function awaitingFulfilment(school: ScopeId, service: ServiceId): number {
  const n = openRequests(school, service)
  return n === 0 ? 0 : Math.max(1, Math.round(n / 35))
}

/** Diplomas move through stages, so one number per school would hide the bottleneck. */
export const DIPLOMA_QUEUE: Record<string, { scheduled: number; inProgress: number }> = {
  panda: { scheduled: 4, inProgress: 1 },
  bambusa: { scheduled: 3, inProgress: 2 }
}

/** Documents received per day for the last fortnight. The two dips are weekends. */
export const RECEIVE_TREND = [31, 38, 44, 40, 43, 18, 14, 33, 46, 49, 45, 47, 24, 19]
export const RECEIVE_FACTS = { toDownload: 4, pendingZips: 1 }

/**
 * People who can administer the district. A district admin inherits other
 * people's work, so "who else is in here, and is anyone's access going unused"
 * is a district-level question that no single service can answer.
 */
export const DISTRICT_USERS = { total: 11, active: 8, dormant: 3, dormantDays: 90 }

export function entitlementSummary(id: ScopeId, c: Config): string {
  const svc = servicesFor(id, c)
  const role = SCOPES[id].kind === 'district' ? 'District admin' : 'Admin'
  if (svc.length === 0) return role
  if (SCOPES[id].kind === 'district') {
    const n = SCHOOL_IDS.length
    return `${role} · ${svc.length} service${svc.length > 1 ? 's' : ''} across ${n} school${n > 1 ? 's' : ''}`
  }
  return `${role} · ${svc.map((s) => SERVICES[s].name).join(', ')}`
}

/**
 * The Workspace card used to say "open orders / Add credentials / Manage
 * learners" no matter which service you were in, which made Badges look like
 * Transcripts. Each service gets its own primary unit of work.
 */
export type QuickAction = { label: string; detail: string; cta: string }

const WORK: Record<ServiceId, { unit: string; rest: QuickAction[] }> = {
  transcript: {
    unit: 'open orders',
    rest: [
      { label: 'Add credentials', detail: 'Upload and match new transcript records.', cta: 'Add credentials' },
      { label: 'Manage learners', detail: 'Review and manage learner records.', cta: 'Manage learners' }
    ]
  },
  diploma: {
    unit: 'diploma orders',
    rest: [
      { label: 'Approve a print run', detail: 'Release approved diplomas to the printer.', cta: 'Review print run' },
      { label: 'Edit the template', detail: 'Seal, signatures and wording.', cta: 'Edit template' }
    ]
  },
  dualEnrollment: {
    unit: 'enrolment requests',
    rest: [
      { label: 'Open the course catalogue', detail: 'Courses offered to secondary learners.', cta: 'Open catalogue' },
      { label: 'Confirm the term', detail: 'Registration windows and deadlines.', cta: 'Confirm dates' }
    ]
  },
  receive: {
    unit: 'documents to match',
    rest: [
      { label: 'Resolve unmatched documents', detail: 'Incoming records with no learner attached.', cta: 'Resolve' },
      { label: 'Set matching rules', detail: 'How inbound records find a learner.', cta: 'Edit rules' }
    ]
  },
  send: {
    unit: 'outbound deliveries',
    rest: [
      { label: 'Retry bounced deliveries', detail: 'Recipients that rejected a send.', cta: 'Retry' },
      { label: 'Manage recipients', detail: 'Destinations this school sends to.', cta: 'Manage recipients' }
    ]
  },
  verify: {
    unit: 'verification requests',
    rest: [
      { label: 'Chase learner consent', detail: 'Requests waiting on the learner.', cta: 'Send reminder' },
      { label: 'Download the audit log', detail: 'Every verification and its outcome.', cta: 'Download log' }
    ]
  },
  badges: {
    unit: 'badges to issue',
    rest: [
      { label: 'Open the badge catalogue', detail: 'Badges this school can award.', cta: 'Open catalogue' },
      { label: 'Nudge unclaimed earners', detail: 'Badges issued but never claimed.', cta: 'Send reminder' }
    ]
  }
}

export function quickActions(scope: ScopeId, service: ServiceId): QuickAction[] {
  const w = WORK[service]
  const n = openRequests(scope, service)
  return [
    { label: `${n} ${w.unit}`, detail: `Waiting on you in ${SCOPES[scope].name}.`, cta: 'Open the queue' },
    ...w.rest
  ]
}
