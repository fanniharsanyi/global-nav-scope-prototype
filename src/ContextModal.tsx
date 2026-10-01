import { useEffect, useMemo, useState } from 'react'
import {
  Modal, Heading, CloseButton, Button, Text, View, TextInput, Alert, Checkbox
} from '@instructure/ui'
import { ISearch } from './Icons'
import {
  type Config, type ScopeId, type WorkspaceId,
  SCOPES, WORKSPACES, availableScopes, entitlementSummary, servicesFor
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
 * browser tab. Here both halves of the answer are picked together, once, and
 * nothing is committed until Apply.
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

  const services = servicesFor(pickedScope, config)

  // Picking a school silently rewrites the Service column. Sighted users see
  // it happen; screen reader users get nothing unless we say so. Announced
  // from the handler rather than an effect so it never fires on mount.
  function chooseScope(id: ScopeId) {
    setPickedScope(id)
    const next = servicesFor(id, config)
    if (next.length === 0) {
      setAnnounce(`${SCOPES[id].name} selected. No Parchment services available here.`)
      return
    }
    const kept = next.includes(pickedWs as never)
    const landing = kept ? pickedWs : next[0]
    setAnnounce(
      `${SCOPES[id].name} selected. Service list updated, ${next.length} ` +
        `${next.length === 1 ? 'service' : 'services'} available. ` +
        `${WORKSPACES[landing].name} selected.`
    )
  }

  function search(v: string) {
    setQuery(v)
    const q = v.trim().toLowerCase()
    if (!q) {
      setAnnounce(`Showing all ${allScopes.length} schools.`)
      return
    }
    const n = allScopes.filter((id) => SCOPES[id].name.toLowerCase().includes(q)).length
    setAnnounce(n === 1 ? '1 school matches.' : `${n} schools match.`)
  }

  // A service the new school does not offer cannot stay selected.
  useEffect(() => {
    if (services.length === 0) return
    if (!services.includes(pickedWs as never)) setPickedWs(services[0])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedScope])

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return allScopes
    return allScopes.filter((id) => SCOPES[id].name.toLowerCase().includes(q))
  }, [query, allScopes])

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
        const here = servicesFor(scope, config)
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
          <section className="ctx__col" aria-labelledby="ctx-school">
            <h3 className="ctx__head" id="ctx-school">
              School
            </h3>

            <TextInput
              renderLabel={<span className="visually-hidden">Search schools</span>}
              placeholder="Search districts and schools"
              value={query}
              onChange={(_e, v) => search(v)}
              renderBeforeInput={<ISearch size={18} />}
            />

            <fieldset className="scopeset">
              <legend className="visually-hidden">Choose a school</legend>
              {rows.map((id) => {
                const s = SCOPES[id]
                const on = pickedScope === id
                return (
                  <label key={id} className={`scoperow${on ? ' scoperow--on' : ''}`}>
                    <input
                      type="radio"
                      name="ctx-scope"
                      value={id}
                      checked={on}
                      onChange={() => chooseScope(id)}
                    />
                    <span className="scoperow__body">
                      <span className="scoperow__name">
                        {s.name}
                        {id === scope && <span className="scoperow__pill">Current</span>}
                      </span>
                      <span className="scoperow__meta">{entitlementSummary(id, config)}</span>
                    </span>
                  </label>
                )
              })}
              {rows.length === 0 && (
                <Text color="secondary">No district or school matches “{query}”.</Text>
              )}
            </fieldset>
          </section>

          <section className="ctx__col" aria-labelledby="ctx-service">
            <h3 className="ctx__head" id="ctx-service">
              Service
            </h3>
            <p className="ctx__sub">
              {services.length > 0
                ? `Offered at ${SCOPES[pickedScope].name}.`
                : `${SCOPES[pickedScope].name} has no Parchment services yet.`}
            </p>

            <fieldset className="scopeset">
              <legend className="visually-hidden">Choose a service</legend>
              {services.map((id) => {
                const w = WORKSPACES[id]
                const on = pickedWs === id
                return (
                  <label key={id} className={`scoperow${on ? ' scoperow--on' : ''}`}>
                    <input
                      type="radio"
                      name="ctx-ws"
                      value={id}
                      checked={on}
                      onChange={() => setPickedWs(id)}
                    />
                    <span className="scoperow__body">
                      <span className="scoperow__name">
                        {w.name}
                        {id === workspace && pickedScope === scope && (
                          <span className="scoperow__pill">Current</span>
                        )}
                      </span>
                      <span className="scoperow__meta">
                        {w.pages.map((p) => p.label).join(' · ')}
                      </span>
                    </span>
                  </label>
                )
              })}
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
            label="Start here next time"
            checked={makeDefault}
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
