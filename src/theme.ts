import { canvas, canvasHighContrast } from '@instructure/ui'
import type { UiPreferences } from './model'

/**
 * Typography and radii only. Colours are handled in CSS so InstUI's own
 * contrast tokens keep working — overriding them re-tints chrome we do not own.
 */
const heading = '"Inclusive Sans", system-ui, sans-serif'
const body = '"Atkinson Hyperlegible Next", "Atkinson Hyperlegible", system-ui, sans-serif'

export const parchment = {
  ...canvas,
  typography: {
    ...canvas.typography,
    fontFamily: body,
    fontFamilyHeading: heading
  },
  borders: {
    ...canvas.borders,
    radiusSmall: '8px',
    radiusMedium: '12px',
    radiusLarge: '24px'
  }
}

const dyslexic = '"OpenDyslexic", "Atkinson Hyperlegible Next", "Comic Sans MS", system-ui, sans-serif'

/**
 * High contrast is InstUI's own theme rather than a hand-tuned palette, so the
 * components we do not own stay compliant instead of merely looking darker.
 */
/**
 * Dark mode only re-points InstUI's semantic surface and text tokens. The
 * contrast primitives are left alone so components that reason about contrast
 * keep working.
 */
const darkUi = {
  surfacePagePrimary: '#10171f',
  surfacePageSecondary: '#1b242e',
  surfaceCardPrimary: '#1b242e',
  surfaceCardSecondary: '#232e3a',
  textTitle: '#f2f4f5',
  textDescription: '#cfd8e0',
  textBody: '#e6ebf0',
  textTimestamp: '#b4bec6',
  textAuthor: '#e6ebf0',
  textDatapoint: '#f2f4f5',
  textLink: '#8ec5ff',
  textPlaceholder: '#9aa6b1',
  lineStroke: '#3c4a57',
  lineDivider: '#33414e',
  surfaceDivider: '#33414e',
  iconDefault: '#cfd8e0'
}

export function themeFor(ui: UiPreferences) {
  let base = ui.highContrast ? { ...canvasHighContrast, borders: parchment.borders } : parchment
  if (ui.dyslexic) {
    base = {
      ...base,
      typography: { ...base.typography, fontFamily: dyslexic, fontFamilyHeading: dyslexic }
    }
  }
  if (!ui.dark || ui.highContrast) return base
  return {
    ...base,
    colors: {
      ...base.colors,
      ui: { ...base.colors.ui, ...darkUi },
      // Components that predate the semantic tokens paint straight from these,
      // so dark mode has to flip the page-level pair as well.
      contrasts: {
        ...base.colors.contrasts,
        white1010: '#1b242e',
        grey1111: '#232e3a',
        grey1214: '#3c4a57',
        grey1424: '#46545f',
        grey125125: '#f2f4f5',
        grey100100: '#e6ebf0',
        grey4570: '#b4bec6',
        grey5782: '#cfd8e0'
      }
    }
  }
}
