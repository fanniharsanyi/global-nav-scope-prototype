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
  services: ServiceId[]
}

/**
 * The inversion this prototype is arguing for.
 *
 * Ken's prototype models `service -> schools`, which is why school has to be
 * re-asked every time service changes, and why four services open on three
 * different schools. Here it is `scope -> services`: scope is the single axis,
 * and the service list is derived from it.
 */
export const SCOPES: Record<ScopeId, Scope> = {
  district: {
    id: 'district',
    name: 'Bambusa District',
    kind: 'district',
    detail: '12 schools · Denver, Colorado',
    services: ['transcript', 'diploma', 'dualEnrollment', 'receive', 'send', 'verify', 'badges']
  },
  bambusa: {
    id: 'bambusa',
    name: 'Bambusa University',
    kind: 'school',
    detail: '4-year private · 18,400 learners',
    services: ['transcript', 'diploma', 'dualEnrollment', 'receive', 'send', 'verify']
  },
  panda: {
    id: 'panda',
    name: 'Panda High School',
    kind: 'school',
    detail: 'Secondary · 1,260 learners',
    services: ['transcript', 'diploma', 'receive', 'badges']
  },
  meridian: {
    id: 'meridian',
    name: 'Meridian Community College',
    kind: 'school',
    detail: '2-year public · 9,700 learners',
    services: ['transcript', 'dualEnrollment', 'receive', 'send', 'badges']
  }
}

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

export type PageId = string

export type NavItem = { id: PageId; label: string; icon: string }

/**
 * Each workspace brings its own page set. This is the thing that rules out
 * flattening services into the rail: there are seven different sets here and
 * four of them contain a page called "Settings".
 */
export type WorkspaceId = ServiceId | 'learner' | 'platform'

export const WORKSPACES: Record<
  WorkspaceId,
  { id: WorkspaceId; name: string; scoped: boolean; pages: NavItem[] }
> = {
  transcript: {
    id: 'transcript',
    name: 'Transcript Services',
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
  const out: WorkspaceId[] = [...servicesFor(scope, c)]
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
}

export const DEFAULT_PREFERENCES: Preferences = {
  defaultService: null,
  defaultSchoolByService: {},
  resumeLast: true
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
  return availableScopes(c).filter((s) => (servicesFor(s, c) as WorkspaceId[]).includes(ws))
}

/** Every service reachable by this user, across every school they can see. */
export function allServices(c: Config): WorkspaceId[] {
  const seen = new Set<WorkspaceId>()
  for (const s of availableScopes(c)) for (const w of servicesFor(s, c)) seen.add(w)
  if (isLearner(c)) seen.add('learner')
  return [...seen]
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
export function entitlementSummary(id: ScopeId, c: Config): string {
  const svc = servicesFor(id, c)
  const role = SCOPES[id].kind === 'district' ? 'District admin' : 'Admin'
  if (svc.length === 0) return role
  if (SCOPES[id].kind === 'district') {
    return `${role} · ${svc.length} service${svc.length > 1 ? 's' : ''} across 12 schools`
  }
  return `${role} · ${svc.map((s) => SERVICES[s].name).join(', ')}`
}
