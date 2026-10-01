# Parchment on InstUI — scope prototype

A working alternative to the current Parchment global-nav prototype, built with real
[`@instructure/ui`](https://instructure.design) components. Nothing here is a bespoke
Parchment control, which is the point: if the design system can't express the idea,
the idea is wrong.

**Live:** https://fanniharsanyi.github.io/parchment-instui-scope-prototype/

## The argument in one line

> There is one axis — **scope** — and it gets one persistent label and one control.
> Services are not scope. They are navigation.

## What changes

| Current prototype | This one |
|---|---|
| Three places to switch context: Account rail, a grid icon in the page header, and a "schoolband" strip inside `<main>` | **One** scope control, in the Account subNav, mirrored as a label in the rail |
| Switching service opens a new simulated browser tab | Services are nav items. You click them, like Courses in Canvas |
| A bespoke `svcsw` menu with `role="menu"` | `Modal`, `RadioInput`, `TextInput` — stock InstUI |
| School is modelled *per service* | Scope is a single axis. District is a wider value on it, not a second axis |
| "Where you start" = 5 radios + 4 selects = 9 decisions, applied next sign-in | 1 select + 1 optional checkbox + a landing list that is literally the rail. Applied immediately |
| Scope label scrolls away with the page | Scope label is in the rail, always on screen |
| No live announcement on context change | `role="status"` announces the new scope |

## The bug that proves the point

The current prototype ships this default:

```js
defaultSchoolByService: {
  transcript: "bambusa",
  diploma: "panda",
  dualEnrollment: "meridian",
  receive: "bambusa"
}
```

Four services, three different schools. Its own settings copy admits it:

> *"Services cover different schools, so this is set per service rather than once."*

Open all four and you are simultaneously in Bambusa, Panda and Meridian, with no single
answer to "which school am I in". That is why three switchers were needed — school is a
child of service, so it has to be re-asked every time service changes. Flip the model and
all three collapse into one.

## Accessibility

- Skip link to `<main>`
- `<nav aria-label="Global">`, `aria-current="page"` on the active item
- Account subNav: focus moves to its heading on open, returns to the Account button on close, `Escape` closes
- Scope change announced through `role="status" aria-live="polite"`
- The unsaved-changes warning is **conditional** — it appears only when there are unsaved changes
- When there is only one scope, the label is plain text, not a dead button

## Try these

Set up the account on the sign-in screen, exactly like the original harness:

- **Learner only** → no scope control at all. The degradation case.
- **Multiple schools off** → scope label renders as text, not a button.
- **District admin on** → scope starts at all 12 schools and narrows to one, in the same control.
- **One service only** → one nav item, and the rail still makes sense.
- **Account Settings → Where you start** → two decisions instead of nine.

## Run it

```bash
npm install
npm run dev
```

## Credit

The configuration harness and the scenario set are modelled on Ken Arendt's prototype so
the two are directly comparable.
