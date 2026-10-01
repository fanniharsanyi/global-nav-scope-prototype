import { useId } from 'react'
import { View, Heading, Text, SimpleSelect, Checkbox, Alert } from '@instructure/ui'
import {
  IFile, IAward, IBook, IInbox, IExternal, ICheck, ISearch, IUser, ISettings, IDashboard
} from './Icons'
import Crest from './Crest'
import {
  type Config, type Preferences, type ScopeId, type WorkspaceId,
  SCOPES, SERVICES, WORKSPACES, allServices, schoolsForService, resolveStart
} from './model'

const ICONS: Record<string, typeof IFile> = {
  file: IFile, award: IAward, book: IBook, inbox: IInbox, external: IExternal,
  check: ICheck, search: ISearch, user: IUser, settings: ISettings
}
const iconFor = (ws: WorkspaceId) => ICONS[WORKSPACES[ws].icon] ?? IDashboard

type Props = {
  config: Config
  prefs: Preferences
  onChange: (p: Preferences) => void
}

/**
 * "Where you start", rebuilt on the original prototype's data model and its
 * visual treatment: one selectable card per destination, each carrying the
 * service icon, its name and what it is for. A card is a bigger target than a
 * bare radio and it lets the description sit inside the thing you click, so
 * the choice can be read without cross-referencing a legend.
 *
 * Three things still differ from the original.
 *
 * It lives in the account area rather than Platform Settings. In the original
 * this panel is rendered in exactly one place — the super user platform screen
 * — so an ordinary admin cannot set where their own day begins. That is a
 * personal preference behind an administrative gate.
 *
 * It applies now rather than at next sign-in, so you can see what you chose.
 *
 * And it is no longer the only way to set this: the same preference can be
 * saved from the context dialog, at the moment you already know the answer.
 */
export default function WhereYouStart({ config, prefs, onChange }: Props) {
  const name = useId()
  const services = allServices(config)
  const start = resolveStart(config, prefs)

  // The original gates each school control on the service being offered at more
  // than one school. Worth keeping: one school is not a choice.
  const withChoice = services.filter((ws) => schoolsForService(ws, config).length > 1)

  if (services.length < 2 && withChoice.length === 0) {
    return (
      <View as="div" maxWidth="44rem">
        <Heading level="h2" margin="0 0 small 0">Where you start</Heading>
        <Alert variant="info" margin="0" hasShadow={false}>
          You have one place to work, so there is nothing to choose. This block appears only when a
          choice actually exists.
        </Alert>
      </View>
    )
  }

  const selected = prefs.defaultService ?? start.workspace
  const setService = (id: WorkspaceId) => onChange({ ...prefs, defaultService: id })
  const setSchool = (ws: WorkspaceId, scope: ScopeId) =>
    onChange({
      ...prefs,
      defaultSchoolByService: { ...prefs.defaultSchoolByService, [ws]: scope }
    })

  return (
    <View as="div" maxWidth="44rem">
      <Heading level="h2" margin="0 0 x-small 0">Where you start</Heading>
      <View as="div" margin="0 0 medium 0">
        <Text as="p" color="secondary">
          The page you land on when you sign in. Applied straight away, not the next time.
        </Text>
      </View>

      {services.length > 1 && (
        <fieldset className="wys__set">
          <legend className="wys__legend">Landing page</legend>
          <ul className="wys__list">
            {services.map((ws) => {
              const Icon = iconFor(ws)
              const on = ws === selected
              const blurb = SERVICES[ws as keyof typeof SERVICES]?.blurb
              return (
                <li key={ws}>
                  <label className={`wys__row${on ? ' wys__row--on' : ''}`}>
                    <input
                      className="wys__radio"
                      type="radio"
                      name={name}
                      value={ws}
                      checked={on}
                      onChange={() => setService(ws)}
                    />
                    <span className="wys__dot" aria-hidden="true" />
                    <span className="wys__icon" aria-hidden="true"><Icon size={20} /></span>
                    <span className="wys__text">
                      <span className="wys__name">{WORKSPACES[ws].name}</span>
                      <span className="wys__desc">
                        {blurb ?? WORKSPACES[ws].pages.map((p) => p.label).join(' · ')}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </fieldset>
      )}

      {withChoice.length > 0 && (
        <div className="wys__schools">
          <Heading level="h3" margin="0 0 x-small 0">Default school</Heading>
          <View as="div" margin="0 0 small 0">
            <Text as="p" color="secondary" size="small">
              The school each service opens on. Services cover different schools, so this is set
              per service rather than once.
            </Text>
          </View>

          <ul className="wys__list">
            {withChoice.map((ws) => {
              const homes = schoolsForService(ws, config)
              const value = prefs.defaultSchoolByService[ws] ?? homes[0]
              const Icon = iconFor(ws)
              return (
                <li className="wys__school-row" key={ws}>
                  <span className="wys__school-label">
                    <span className="wys__icon" aria-hidden="true"><Icon size={20} /></span>
                    {WORKSPACES[ws].name}
                  </span>
                  <span className="wys__school-control">
                    <span className="wys__crest" aria-hidden="true"><Crest size={24} /></span>
                    <SimpleSelect
                      renderLabel={
                        <span className="wys__legend">{`Default school for ${WORKSPACES[ws].name}`}</span>
                      }
                      value={value}
                      onChange={(_e, { value: v }) => setSchool(ws, v as ScopeId)}
                    >
                      {homes.map((s) => (
                        <SimpleSelect.Option key={s} id={`${ws}-${s}`} value={s}>
                          {SCOPES[s].name}
                        </SimpleSelect.Option>
                      ))}
                    </SimpleSelect>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="wys__schools">
        <Checkbox
          label="Start where I left off"
          checked={prefs.resumeLast}
          onChange={() => onChange({ ...prefs, resumeLast: !prefs.resumeLast })}
          messages={[{ type: 'hint', text: 'Overrides the defaults above with your last context.' }]}
        />
        <View as="div" margin="medium 0 0 0">
          <Alert variant="info" margin="0" hasShadow={false}>
            {start.scope
              ? `You will start in ${WORKSPACES[start.workspace].name} at ${SCOPES[start.scope].name}.`
              : `You will start in ${WORKSPACES[start.workspace].name}.`}
          </Alert>
        </View>
      </div>
    </View>
  )
}
