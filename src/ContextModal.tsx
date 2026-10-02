import { useEffect, useMemo, useState } from 'react'
import {
  Modal, Heading, CloseButton, Button, Text, View, TextInput, Alert, Checkbox
} from '@instructure/ui'
import { ISearch } from './Icons'
import {
  type Config, type ScopeId, type ServiceId, type WorkspaceId,
  SCOPES, WORKSPACES, SERVICES, allServices, availableScopes, entitlementSummary, schoolsForService,
  schoolsOffering, openRequests
} from './model'

type Props = {
  open: boolean
  scope: ScopeId
  workspace: WorkspaceId
  config: Config
  dirty: boolean
  onClose: () => void
  onApply: (scope: ScopeId, workspace: WorkspaceId, makeDefault: boolean) => void
  isDefault: boolean
}

/**
 * One control for the whole "where am I working" question.
 *
 * Ken's prototype asks this in three places: the rail institution row, the
 * page-title chevron and a grid menu in the utility bar. Two of them open a new
 * browser tab. Here both halves are picked together, once, and nothing is
 * committed until Apply.
 *
 * Service comes first because entitlement is resolved service first: the
 * platform knows which services this sign-in holds, and the schools follow
 * from whichever one is chosen. Asking for school first would imply a school
 * can be picked before we know what it is being picked *for*.
 */
export default function ContextModal({
  open, scope, workspace, config, dirty, isDefault, onClose, onApply
}: Props) {
  const allScopes = availableScopes(config)
  const [query, setQuery] = useState('')
  const [pickedScope, setPickedScope] = useState<ScopeId>(scope)
  const [pickedWs, setPickedWs] = useState<WorkspaceId>(workspace)
  const [announce, setAnnounce] = useState('')
  const [makeDefault, setMakeDefault] = useState(false)

  const services = allServices(config).filter((w) => WORKSPACES[w].scoped)
  const schools = schoolsForService(pickedWs, config)

  // Picking a service silently rewrites the School column. Sighted users see
  // it happen; screen reader users get nothing unless we say so. Announced
  // from the handler rather than an effect so it never fires on mount.
  function chooseService(id: WorkspaceId) {
    setPickedWs(id)
    setQuery('')
    const next = schoolsForService(id, config)
    if (next.length === 0) {
      setAnnounce(`${WORKSPACES[id].name} selected. No schools run this service.`)
      return
    }
    const landing = next.includes(pickedScope) ? pickedScope : next[0]
    const n = next.filter((sc) => SCOPES[sc].kind !== 'district').length
    const district = next.some((sc) => SCOPES[sc].kind === 'district')
    setAnnounce(
      `${WORKSPACES[id].name} selected. School list updated, ${n} ` +
        `${n === 1 ? 'school' : 'schools'}` +
        `${district ? ' plus the whole district' : ''}. ` +
        `${SCOPES[landing].name} selected.`
    )
  }

  function search(v: string) {
    setQuery(v)
    const q = v.trim().toLowerCase()
    if (!q) {
      setAnnounce(`Showing all ${schools.length} schools.`)
      return
    }
    const n = schools.filter((id) => SCOPES[id].name.toLowerCase().includes(q)).length
    setAnnounce(n === 1 ? '1 school matches.' : `${n} schools match.`)
  }

  // A school that does not run the newly picked service cannot stay selected.
  useEffect(() => {
    if (schools.length === 0) return
    if (!schools.includes(pickedScope)) setPickedScope(schools[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedWs])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return schools
    return schools.filter((id) => SCOPES[id].name.toLowerCase().includes(q))
  }, [query, schools])

  const changed = pickedScope !== scope || pickedWs !== workspace

  return (
    <Modal
      open={open}
      onDismiss={onClose}
      onOpen={() => {
        setPickedScope(scope)
        // The modal is School × Service only. If you came from a non-scoped
        // workspace (your own account), preselect a real service rather than
        // showing an empty Service column.
        const here = allServices(config).filter((w) => WORKSPACES[w].scoped)
        setPickedWs(
          WORKSPACES[workspace].scoped ? workspace : (here[0] ?? workspace)
        )
        setQuery('')
        setAnnounce('')
        setMakeDefault(false)
      }}
      size="large"
      label="Change where you are working"
      shouldCloseOnDocumentClick
      themeOverride={{ borderRadius: '24px' }}
    >
      <Modal.Header>
        <CloseButton placement="end" offset="small" onClick={onClose} screenReaderLabel="Close" />
        <Heading level="h2">Where you are working</Heading>
      </Modal.Header>

      <Modal.Body>
        <div
          className="visually-hidden"
          data-ctx-live=""
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {announce}
        </div>

        <Text as="p">
          You are in <Text weight="bold">{WORKSPACES[workspace].name}</Text>
          {WORKSPACES[workspace].scoped ? (
            <>
              {' '}at <Text weight="bold">{SCOPES[scope].name}</Text>
            </>
          ) : null}
          . Both halves are picked here, together, and nothing changes until you apply.
        </Text>

        <div className="ctx">
          <section className="ctx__col" aria-labelledby="ctx-service">
            <h3 className="ctx__head" id="ctx-service">
              1. Service
            </h3>
            <p className="ctx__sub">
              {(() => {
                const n = services.filter((w) => w !== 'overview').length
                const ov = services.includes('overview')
                return n === 1
                  ? `This sign-in holds one service${ov ? ', plus the district roll-up' : ''}.`
                  : `This sign-in holds ${n} services${ov ? ', plus the district roll-up' : ''}.`
              })()}
            </p>

            <fieldset className="scopeset">
              <legend className="visually-hidden">Choose a service</legend>
              {services.map((id) => {
                const w = WORKSPACES[id]
                const on = pickedWs === id
                const homes = schoolsForService(id, config).filter(
                  (sc) => SCOPES[sc].kind !== 'district'
                )
                return (
                  <label key={id} className={`scoperow${on ? ' scoperow--on' : ''}`}>
                    <input
                      type="radio"
                      name="ctx-ws"
                      value={id}
                      checked={on}
                      onChange={() => chooseService(id)}
                    />
                    <span className="scoperow__body">
                      <span className="scoperow__name">
                        {w.name}
                        {id === workspace && <span className="scoperow__pill">Current</span>}
                      </span>
                      <span className="scoperow__meta">
                        {id === 'overview'
                          ? 'Every service in the district, side by side'
                          : `${homes.length} ${homes.length === 1 ? 'school' : 'schools'} · ${SERVICES[id as ServiceId].blurb}`}
                      </span>
                    </span>
                  </label>
                )
              })}
            </fieldset>
          </section>

          <section className="ctx__col" aria-labelledby="ctx-school">
            <h3 className="ctx__head" id="ctx-school">
              2. School
            </h3>
            <p className="ctx__sub">
              {schools.length === 0
                ? `No school runs ${WORKSPACES[pickedWs].name} yet.`
                : pickedWs === 'overview'
                  ? 'The overview is the district roll-up, so there is nothing else to pick.'
                  : (() => {
                      const n = schools.filter((sc) => SCOPES[sc].kind !== 'district').length
                      const all = allScopes.filter((sc) => SCOPES[sc].kind !== 'district').length
                      return n === all
                        ? `All ${all} of your schools run ${WORKSPACES[pickedWs].name}.`
                        : `${n} of your ${all} schools run ${WORKSPACES[pickedWs].name}.`
                    })()}
            </p>

            {schools.length > 1 && (
              <TextInput
                renderLabel={<span className="visually-hidden">Search schools</span>}
                placeholder="Search districts and schools"
                value={query}
                onChange={(_e, v) => search(v)}
                renderBeforeInput={<ISearch size={18} />}
              />
            )}

            <fieldset className="scopeset">
              <legend className="visually-hidden">Choose a school</legend>
              {rows.map((id) => {
                const sc = SCOPES[id]
                const on = pickedScope === id
                const run =
                  pickedWs === 'overview' || sc.kind !== 'district'
                    ? null
                    : schoolsOffering(pickedWs as ServiceId).length
                return (
                  <label key={id} className={`scoperow${on ? ' scoperow--on' : ''}`}>
                    <input
                      type="radio"
                      name="ctx-scope"
                      value={id}
                      checked={on}
                      onChange={() => setPickedScope(id)}
                    />
                    <span className="scoperow__body">
                      <span className="scoperow__name">
                        {sc.name}
                        {id === scope && pickedWs === workspace && (
                          <span className="scoperow__pill">Current</span>
                        )}
                      </span>
                      <span className="scoperow__meta">
                        {run !== null
                          ? `All schools that run it · ${run} of 3 · ${openRequests('district', pickedWs as ServiceId)} open`
                          : entitlementSummary(id, config)}
                      </span>
                    </span>
                  </label>
                )
              })}
              {rows.length === 0 && schools.length > 0 && (
                <Text color="secondary">No district or school matches “{query}”.</Text>
              )}
            </fieldset>
          </section>
        </div>

        {dirty && (
          <View as="div" margin="medium 0 0 0">
            <Alert variant="warning" margin="0" hasShadow={false}>
              You have unsaved changes on this page. They will be lost.
            </Alert>
          </View>
        )}
      </Modal.Body>

      <Modal.Footer>
        <div className="ctx__foot">
          <Checkbox
            variant="toggle"
            size="small"
            label="Start here next time"
            checked={makeDefault || (isDefault && !changed)}
            disabled={isDefault && !changed}
            onChange={() => setMakeDefault((v) => !v)}
            messages={
              isDefault && !changed
                ? [{ type: 'hint', text: 'This is already where you start.' }]
                : []
            }
          />
        </div>
        <Button onClick={onClose} margin="0 x-small 0 0">
          Cancel
        </Button>
        <Button
          color="primary"
          interaction={changed ? 'enabled' : 'disabled'}
          onClick={() => onApply(pickedScope, pickedWs, makeDefault)}
        >
          Apply
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
