import { useEffect, useRef, useState } from 'react'
import type { JSX } from 'react'
import { View, Alert, Tooltip } from '@instructure/ui'
import {
  IDashboard, IFile, IAward, IUsers, IInbox, IHelp, IUser, ISettings,
  IBell, IMaximize, IUpDown, IPanelClose, ILogOut, IChevronRight,
  IChart, IBook, ICalendar, IBuilding, IExternal, ICanvas, IMastery
} from './Icons'
import {
  type Config, type PageId, type Preferences, type ScopeId, type WorkspaceId,
  SCOPES, WORKSPACES, USER, availableScopes, workspacesFor, pagesFor, roleLabel, isLearner,
  resolveStart
} from './model'
import ContextModal from './ContextModal'
import Pages from './Pages'
import Crest from './Crest'
import BrowserChrome from './BrowserChrome'

const ICONS: Record<string, typeof IDashboard> = {
  dashboard: IDashboard,
  file: IFile,
  award: IAward,
  users: IUsers,
  inbox: IInbox,
  help: IHelp,
  settings: ISettings,
  chart: IChart,
  book: IBook,
  calendar: ICalendar,
  building: IBuilding
}

const initials = (n: string) =>
  n.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()

type Props = {
  config: Config
  prefs: Preferences
  onPrefs: (p: Preferences) => void
  onSignOut: () => void
}

export default function Shell({ config, prefs, onPrefs, onSignOut }: Props) {
  const scopes = availableScopes(config)
  const canSwitch = scopes.length > 1

  // Sign-in lands on the saved preference, not on whatever happens to be first.
  const start = resolveStart(config, prefs)
  const [scope, setScope] = useState<ScopeId | null>(start.scope)
  const [workspace, setWorkspace] = useState<WorkspaceId>(start.workspace)
  const [page, setPage] = useState<PageId>(pagesFor(start.workspace)[0].id)
  const [subNavOpen, setSubNavOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  // 'success' = something changed here. 'info' = you are about to leave.
  const [announceKind, setAnnounceKind] = useState<'success' | 'info'>('success')
  const setPrefs = onPrefs

  const accountBtn = useRef<HTMLButtonElement | null>(null)
  const panelTitle = useRef<HTMLHeadingElement | null>(null)
  const scopeTrigger = useRef<HTMLButtonElement | null>(null)

  const ws = WORKSPACES[workspace]
  const items = pagesFor(workspace)
  const current = items.find((i) => i.id === page)

  useEffect(() => {
    if (!items.some((i) => i.id === page)) setPage(items[0].id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace])

  useEffect(() => {
    if (subNavOpen) panelTitle.current?.focus()
  }, [subNavOpen])

  const closeSubNav = () => {
    setSubNavOpen(false)
    accountBtn.current?.focus()
  }

  const applyContext = (nextScope: ScopeId, nextWs: WorkspaceId, makeDefault = false) => {
    const sameWs = nextWs === workspace
    setScope(nextScope)
    setWorkspace(nextWs)
    if (!sameWs) setPage(pagesFor(nextWs)[0].id)
    setModalOpen(false)
    setDirty(false)
    // Saving the default here is the point: you are told the answer at the
    // moment you already know it, instead of being sent to a settings screen
    // to reconstruct it from memory later.
    if (makeDefault) {
      onPrefs({
        ...prefs,
        defaultService: nextWs,
        defaultSchoolByService: WORKSPACES[nextWs].scoped
          ? { ...prefs.defaultSchoolByService, [nextWs]: nextScope }
          : prefs.defaultSchoolByService
      })
    }
    setAnnounceKind('success')
    const where = WORKSPACES[nextWs].scoped
      ? `Now in ${WORKSPACES[nextWs].name} at ${SCOPES[nextScope].name}. This tab reloaded; no new tab was opened.`
      : `Now in ${WORKSPACES[nextWs].name}. This workspace is not tied to a school.`
    setAnnouncement(makeDefault ? `${where} Saved as where you start.` : where)
    scopeTrigger.current?.focus()
  }

  const scopeName = scope ? SCOPES[scope].name : 'Parchment'

  // Cross-product destinations. InstUI's GlobalNav treats these as first-class
  // rail items (menu=Mastery / menu=Custom), grouped below the current
  // destination's pages and above Help — not as a top-right grid.
  const products: Array<{ id: string; label: string; Icon: (p: { size?: number }) => JSX.Element }> = []
  if (config.hasCanvas) products.push({ id: 'canvas', label: 'Canvas', Icon: ICanvas })
  if (config.hasMastery) products.push({ id: 'mastery', label: 'Mastery', Icon: IMastery })

  const canChangeContext = canSwitch || workspacesFor(scope, config).length > 1

  const railContext = (
    <>
      <Crest size={32} />
      <span className="gnav__ctx-text">
        <span className="gnav__ctx-school">{ws.scoped ? scopeName : 'Parchment'}</span>
        <span className="gnav__ctx-service">{ws.name}</span>
      </span>
      {canChangeContext && (
        <span className="gnav__institution-caret">
          <IUpDown size={18} />
        </span>
      )}
    </>
  )

  return (
    <BrowserChrome tabTitle={current?.label ?? 'Account Settings'}>
      <div
        className="wrap"
        onKeyDown={(e) => {
          if (e.key === 'Escape' && subNavOpen && !modalOpen) closeSubNav()
        }}
      >
        <a className="skip" href="#main">
          Skip to main content
        </a>

        <div className="gnav">
          <nav className="gnav__rail" aria-label="Global">
            {canChangeContext ? (
              <button
                type="button"
                className="gnav__institution gnav__institution--ctx"
                ref={scopeTrigger}
                onClick={() => setModalOpen(true)}
              >
                {railContext}
              </button>
            ) : (
              <div className="gnav__institution gnav__institution--ctx">{railContext}</div>
            )}

            <button
              type="button"
              ref={accountBtn}
              className={`gnav__account${subNavOpen ? ' gnav__account--active' : ''}`}
              aria-expanded={subNavOpen}
              onClick={() => (subNavOpen ? closeSubNav() : setSubNavOpen(true))}
            >
              <span className="gnav__avatar" aria-hidden="true">
                {initials(USER.name)}
              </span>
              <span style={{ minWidth: 0 }}>
                <span className="gnav__account-name" style={{ display: 'block' }}>
                  {USER.name}
                </span>
                <span className="gnav__account-role" style={{ display: 'block' }}>
                  {roleLabel(scope, config)}
                </span>
              </span>
            </button>

            <ul className="gnav__items">
              {items.map((i) => {
                const Icon = ICONS[i.icon] ?? IDashboard
                const active = page === i.id
                return (
                  <li key={i.id}>
                    <a
                      className={`gnav__item${active ? ' gnav__item--active' : ''}`}
                      href={`#${i.id}`}
                      aria-current={active ? 'page' : undefined}
                      onClick={(e) => {
                        e.preventDefault()
                        setPage(i.id)
                        setSubNavOpen(false)
                      }}
                    >
                      <Icon />
                      <span>{i.label}</span>
                    </a>
                  </li>
                )
              })}
            </ul>

            {products.length > 0 && (
              <>
                <div className="gnav__grouprule" role="presentation" />
                <h2 className="gnav__grouplabel" id="other-products">
                  Other products
                </h2>
                <ul className="gnav__items gnav__items--products" aria-labelledby="other-products">
                  {products.map((p) => (
                    <li key={p.id}>
                      <a
                        className="gnav__item gnav__item--product"
                        href={`#${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          e.preventDefault()
                          setAnnounceKind('info')
                          setAnnouncement(
                            `${p.label} would open in a new tab. You are leaving Parchment.`
                          )
                        }}
                      >
                        <p.Icon />
                        <span>{p.label}</span>
                        <span className="gnav__item-ext">
                          <IExternal size={14} />
                          <span className="sr">Opens in a new tab</span>
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="gnav__grouprule" role="presentation" />
            <ul className="gnav__items">
              <li>
                <a className="gnav__item" href="#help" onClick={(e) => e.preventDefault()}>
                  <IHelp />
                  <span>Help</span>
                </a>
              </li>
            </ul>

            <button type="button" className="gnav__collapse">
              <IPanelClose />
              <span>Collapse sidebar</span>
            </button>
            <div className="gnav__divider" />
            <div className="gnav__product">
              <span className="gnav__product-dot" aria-hidden="true" />
              <span className="gnav__product-name">Parchment</span>
            </div>
          </nav>

          {subNavOpen && (
            <div className="gnav__panel" role="region" aria-label="Account">
              <h2 className="gnav__panel-title" tabIndex={-1} ref={panelTitle}>
                Account
              </h2>

              <div className="gnav__card">
                <div style={{ fontWeight: 600, fontSize: 18 }}>{USER.name}</div>
                <div className="gnav__account-role">{USER.email}</div>
                <div style={{ marginTop: 8 }}>
                  <span className="rolepill">{roleLabel(scope, config)}</span>
                </div>
              </div>

              {scope && (
                <div>
                  <p className="gnav__panel-section-title">Where you are working</p>
                  {canSwitch ? (
                    <button
                      type="button"
                      className="gnav__scope-switch"
                      onClick={() => setModalOpen(true)}
                    >
                      <span>
                        <span className="gnav__institution-eyebrow">
                          {ws.name}
                        </span>
                        <span className="gnav__institution-name" style={{ display: 'block' }}>
                          {ws.scoped ? SCOPES[scope].name : 'Not tied to a school'}
                        </span>
                      </span>
                      <IChevronRight size={18} />
                    </button>
                  ) : (
                    <div className="gnav__card">
                      <span className="gnav__institution-eyebrow">{ws.name}</span>
                      <span className="gnav__institution-name" style={{ display: 'block' }}>
                        {ws.scoped ? SCOPES[scope].name : 'Not tied to a school'}
                      </span>
                    </div>
                  )}
                  <p className="gnav__account-role" style={{ marginTop: 8 }}>
                    School and service are picked together, in one place. Nothing here opens a new
                    tab.
                  </p>
                </div>
              )}

              <div>
                <button
                  type="button"
                  className="gnav__panel-link"
                  disabled={!isLearner(config)}
                  onClick={() => {
                    setWorkspace('learner')
                    setPage('records')
                    closeSubNav()
                  }}
                >
                  <IUser /> My Parchment account
                </button>
                <button
                  type="button"
                  className="gnav__panel-link"
                  onClick={() => {
                    setPage('settings')
                    closeSubNav()
                  }}
                  disabled={!items.some((i) => i.id === 'settings')}
                >
                  <ISettings /> Account Settings
                </button>
              </div>

              <div className="gnav__panel-ui">
                <button type="button" className="gnav__logout" onClick={onSignOut}>
                  <ILogOut /> Log out
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="wrap__container">
          <div className="wrap__content">
            <div className="wrap__topbar">
              <span className="wrap__titleblock">
                <span className="wrap__eyebrow">{ws.name}</span>
                <h1 className="wrap__title">{current?.label ?? 'Dashboard'}</h1>
              </span>
              <div className="wrap__actions">
                <Tooltip renderTip="Notifications">
                  <button type="button" className="ubtn" aria-label="Notifications">
                    <IBell size={22} />
                  </button>
                </Tooltip>
                <Tooltip renderTip="Full screen">
                  <button type="button" className="ubtn" aria-label="Full screen">
                    <IMaximize size={22} />
                  </button>
                </Tooltip>
              </div>
            </div>

            {scope && ws.scoped && (
              <div className="schoolband">
                <div className="schoolband__row">
                  <span className="schoolband__crest">
                    <Crest size={44} />
                  </span>
                  <span className="schoolband__id">
                    <h2 className="schoolband__name">{SCOPES[scope].name}</h2>
                    <p className="schoolband__meta">{SCOPES[scope].detail}</p>
                  </span>
                  {canChangeContext && (
                    <button type="button" className="btn btn--secondary" onClick={() => setModalOpen(true)}>
                      Change school or service
                    </button>
                  )}
                </div>
                <div className="schoolband__rule" />
              </div>
            )}

            <div role="status" aria-live="polite">
              {announcement && (
                <View as="div">
                  <Alert
                    variant={announceKind}
                    margin="0"
                    hasShadow={false}
                    renderCloseButtonLabel="Dismiss"
                    onDismiss={() => setAnnouncement('')}
                  >
                    {announcement}
                  </Alert>
                </View>
              )}
            </div>

            <main id="main" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <Pages
                workspace={workspace}
                page={page}
                scope={scope}
                config={config}
                prefs={prefs}
                onPrefs={setPrefs}
                onDirty={() => setDirty(true)}
              />
            </main>
          </div>
        </div>

        {scope && (
          <ContextModal
            open={modalOpen}
            scope={scope}
            workspace={workspace}
            config={config}
            dirty={dirty}
            isDefault={start.workspace === workspace && start.scope === scope}
            onClose={() => {
              setModalOpen(false)
              scopeTrigger.current?.focus()
            }}
            onApply={applyContext}
          />
        )}
      </div>
    </BrowserChrome>
  )
}
