import { canvas } from '@instructure/ui'

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
