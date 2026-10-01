import { useEffect, useState } from 'react'
import { InstUISettingsProvider } from '@instructure/ui'
import SignIn from './SignIn'
import Shell from './Shell'
import { themeFor } from './theme'
import { DEFAULT_PREFERENCES, type Config, type Preferences } from './model'

const KEY = 'parchment.prefs'

function load(): Preferences {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULT_PREFERENCES
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PREFERENCES
  }
}

export default function App() {
  const [config, setConfig] = useState<Config | null>(null)
  // Preferences outlive the session. Without this, "where you start" could
  // never actually be demonstrated — signing out would forget it.
  const [prefs, setPrefs] = useState<Preferences>(load)

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(prefs))
    } catch {
      /* private browsing */
    }
  }, [prefs])

  // Display preferences belong to the person, so they apply to the whole
  // document rather than to one service's pages.
  useEffect(() => {
    const el = document.documentElement
    el.dataset.uiDark = String(prefs.ui.dark)
    el.dataset.uiDyslexic = String(prefs.ui.dyslexic)
    el.dataset.uiContrast = String(prefs.ui.highContrast)
  }, [prefs.ui])

  return (
    <InstUISettingsProvider theme={themeFor(prefs.ui)}>
      {config ? (
        <Shell
          config={config}
          prefs={prefs}
          onPrefs={setPrefs}
          onSignOut={() => setConfig(null)}
        />
      ) : (
        <SignIn onStart={setConfig} />
      )}
    </InstUISettingsProvider>
  )
}
