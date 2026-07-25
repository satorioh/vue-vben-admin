# Keyword Labeling Sticky Toolbar Design

## Goal

Keep the OCR recognition and keyword labeling controls accessible while the user scrolls
through a long preview. The existing `ocr-recognize-toolbar` and
`keyword-labeling-toolbar` rows remain visually and functionally unchanged.

## Design

Wrap both toolbar rows in a single `keyword-labeling-sticky-toolbar` container. The
container uses CSS `position: sticky` with `top: 0`, so it follows the existing
`.vben-layout-content` scroll container without JavaScript scroll listeners.

The wrapper receives an opaque application-content background and a z-index above the
preview, OCR text elements, selection boxes, and keyword highlights. Existing row spacing
is preserved so the controls remain in two rows and move as one unit. No OCR recognition,
matching, navigation, upload, or selection logic changes are included.

## Interaction and Layout

- At the top of the page, the toolbars keep their current order and spacing.
- After vertical scrolling reaches the toolbar position, both rows remain together at the
  top of the content viewport.
- Preview content scrolls beneath the opaque toolbar without obscuring its controls.
- Buttons, inputs, upload controls, and the border switch remain interactive while sticky.

## Verification

Run the focused lint checks, unit suite, and production build. In the browser, load a tall
OCR preview, scroll the application content, and verify that the wrapper stays at the
content viewport top, both rows remain visible, navigation buttons work, and no console
errors are introduced.
