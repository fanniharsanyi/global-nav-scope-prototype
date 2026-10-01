import type { ReactNode } from 'react'

type Props = { tabTitle: string; children: ReactNode }

/**
 * The simulated browser window from the existing prototype — kept so the two
 * demos read as the same artefact. Here it stays a single tab on purpose:
 * changing scope never spawns another one.
 */
export default function BrowserChrome({ tabTitle, children }: Props) {
  return (
    <div className="browser">
      <div className="browser__chrome" aria-hidden="true">
        <div className="browser__dots">
          <span className="browser__dot browser__dot--red" />
          <span className="browser__dot browser__dot--amber" />
          <span className="browser__dot browser__dot--green" />
        </div>
        <div className="browser__tabs">
          <div className="browser__tab browser__tab--active">
            <span className="browser__tab-favicon" />
            <span className="browser__tab-title">{tabTitle}</span>
          </div>
          <span className="browser__newtab">+</span>
        </div>
        <div className="browser__gemini">One tab, always</div>
      </div>
      <div className="browser__viewport">{children}</div>
    </div>
  )
}
