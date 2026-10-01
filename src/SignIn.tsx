import { useState } from 'react'
import Crest from './Crest'
import {
  type Config, DEFAULT_CONFIG, availableScopes, servicesFor, SCOPES, isAdmin
, USER
} from './model'

type Props = { onStart: (c: Config) => void }

function outcome(c: Config): string {
  const scopes = availableScopes(c)
  if (!isAdmin(c)) return 'Signs in to My credentials. No admin scope, so the nav shows no scope control.'
  const first = scopes[0]
  const svc = servicesFor(first, c)
  if (c.districtAdmin) {
    return `Signs in to ${SCOPES.district.name} with ${svc.length} service${svc.length > 1 ? 's' : ''} in the rail. Scope starts at all 12 schools and can be narrowed to any one of them.`
  }
  if (scopes.length < 2) {
    return `Signs in to ${SCOPES[first].name}. One scope only, so the scope label is shown but is not a control.`
  }
  return `Signs in to ${SCOPES[first].name} with ${svc.length} service${svc.length > 1 ? 's' : ''} in the rail. Scope can be changed to ${scopes.length - 1} other schools.`
}

export default function SignIn({ onStart }: Props) {
  const [c, setC] = useState<Config>(DEFAULT_CONFIG)
  const set = (patch: Partial<Config>) => setC((p) => ({ ...p, ...patch }))
  const scopes = availableScopes(c)

  const shapes: Array<[Config['shape'], string]> = [
    ['both', 'Admin + Learner'],
    ['adminOnly', 'Admin only'],
    ['learnerOnly', 'Learner only']
  ]

  const toggles: Array<[keyof Config, string]> = [
    ['districtAdmin', 'District or master campus admin'],
    ['multiSchool', 'Admin supports multiple schools'],
    ['multiService', 'Admin has more than one Parchment service'],
    ['hasMastery', 'Has Mastery account'],
    ['hasCanvas', 'Has Canvas account'],
    ['idVerification', 'Learner ID verification']
  ]

  return (
    <div className="signin">
      <div className="signin__inner">
        <div className="signin__lockup">
          <Crest size={40} />
          <span>Welcome to Parchment</span>
        </div>

        <div className="signin__card">
          <h1 className="signin__title">Sign in</h1>
          <p className="signin__lede">
            One scope control, services as navigation. Set the account up below, then sign in to see
            what the nav renders.
          </p>

          <label className="signin__field">
            <span className="signin__label">
              E-mail address <span className="signin__req">*</span>
            </span>
            <input type="email" defaultValue={USER.email} readOnly />
          </label>

          <button type="button" className="btn btn--primary signin__cta" onClick={() => onStart(c)}>
            Continue
          </button>
        </div>

        <div className="signin__demo">
          <p className="signin__demo-head">Prototype · this email turns out to have</p>

          <div className="seg" role="group" aria-label="Account type">
            {shapes.map(([v, label]) => (
              <button
                key={v}
                type="button"
                className={`seg__btn${c.shape === v ? ' seg__btn--on' : ''}`}
                aria-pressed={c.shape === v}
                onClick={() => set({ shape: v })}
              >
                {label}
              </button>
            ))}
          </div>

          <ul className="swlist">
            {toggles.map(([k, label]) => {
              const on = Boolean(c[k])
              return (
                <li key={k as string} className="swrow">
                  <span className="swrow__label" id={`lbl-${k as string}`}>
                    {label}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-labelledby={`lbl-${k as string}`}
                    className={`sw${on ? ' sw--on' : ''}`}
                    onClick={() => set({ [k]: !on } as Partial<Config>)}
                  >
                    <span className="sw__knob">{on ? '\u2713' : '\u00d7'}</span>
                  </button>
                </li>
              )
            })}
          </ul>

          <p className="signin__outcome" role="status">
            {outcome(c)}
          </p>
          <p className="signin__scopes">
            Scopes in range: {scopes.map((id) => SCOPES[id].name).join(' \u00b7 ')}
          </p>
        </div>

        <p className="signin__foot">
          Every component on the next screen comes from @instructure/ui or plain semantic markup.
          Nothing is a bespoke Parchment control.
        </p>
      </div>
    </div>
  )
}
