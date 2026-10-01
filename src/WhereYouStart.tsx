import {
  View, Heading, Text, SimpleSelect, Checkbox, RadioInput, RadioInputGroup, Alert, Flex
} from '@instructure/ui'
import Crest from './Crest'
import {
  type Config, type Preferences, type ScopeId, type WorkspaceId,
  SCOPES, WORKSPACES, allServices, schoolsForService, resolveStart
} from './model'

type Props = {
  config: Config
  prefs: Preferences
  onChange: (p: Preferences) => void
}

/**
 * "Where you start", rebuilt on the original prototype's data model.
 *
 * Its structure is kept because it is correct: a landing destination, then a
 * default school per service, and the school control shown only for services
 * offered at more than one school. Three things change.
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
          Applied straight away, not the next time you sign in.
        </Text>
      </View>

      <Flex direction="column" gap="large">
        {services.length > 1 && (
          <Flex.Item>
            <RadioInputGroup
              name="start-service"
              description="Service you land in"
              value={prefs.defaultService ?? start.workspace}
              onChange={(_e, v) => setService(v as WorkspaceId)}
            >
              {services.map((id) => (
                <RadioInput
                  key={id}
                  value={id}
                  label={
                    <span>
                      {WORKSPACES[id].name}
                      <Text size="small" color="secondary">
                        {' '}· {WORKSPACES[id].pages.map((p) => p.label).join(' · ')}
                      </Text>
                    </span>
                  }
                />
              ))}
            </RadioInputGroup>
          </Flex.Item>
        )}

        {withChoice.length > 0 && (
          <Flex.Item>
            <Heading level="h3" margin="0 0 x-small 0">Default school</Heading>
            <View as="div" margin="0 0 small 0">
              <Text as="p" color="secondary" size="small">
                The school each service opens on. Services cover different schools, so this is set
                per service rather than once.
              </Text>
            </View>

            <Flex direction="column" gap="small">
              {withChoice.map((ws) => {
                const homes = schoolsForService(ws, config)
                const value = prefs.defaultSchoolByService[ws] ?? homes[0]
                return (
                  <Flex.Item key={ws}>
                    <div className="startrow">
                      <span className="startrow__crest" aria-hidden="true">
                        <Crest size={24} />
                      </span>
                      <span className="startrow__select">
                        <SimpleSelect
                          renderLabel={WORKSPACES[ws].name}
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
                    </div>
                  </Flex.Item>
                )
              })}
            </Flex>
          </Flex.Item>
        )}

        <Flex.Item>
          <Checkbox
            label="Start where I left off"
            checked={prefs.resumeLast}
            onChange={() => onChange({ ...prefs, resumeLast: !prefs.resumeLast })}
            messages={[{ type: 'hint', text: 'Overrides the defaults above with your last context.' }]}
          />
        </Flex.Item>

        <Flex.Item>
          <Alert variant="info" margin="0" hasShadow={false}>
            {start.scope
              ? `You will start in ${WORKSPACES[start.workspace].name} at ${SCOPES[start.scope].name}.`
              : `You will start in ${WORKSPACES[start.workspace].name}.`}
          </Alert>
        </Flex.Item>
      </Flex>
    </View>
  )
}
