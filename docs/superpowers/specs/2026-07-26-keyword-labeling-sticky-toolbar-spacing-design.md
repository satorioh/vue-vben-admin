# Keyword Labeling Sticky Toolbar Spacing Design

## Problem

The sticky toolbar wrapper currently has no vertical padding. Its first row touches the
top edge, while the keyword row's `margin-bottom: 16px` collapses outside the wrapper and
does not create stable space inside the opaque sticky background.

## Design

Give `.keyword-labeling-sticky-toolbar` `12px` top and bottom padding. Reset
`.keyword-labeling-toolbar` to `margin-bottom: 0` so the lower internal gap is exactly
`12px`, rather than the existing `16px` margin plus the new padding.

Keep the recognition row's existing `mb-4` class. It continues to provide the `16px`
space between the two toolbar rows. The wrapper remains sticky at `top: 0`, retains its
opaque application background and z-index, and receives no JavaScript scroll-state logic.

The `12px` padding applies both before and after the wrapper becomes sticky. OCR,
upload, keyword matching, navigation, selection, and border-toggle behavior remain
unchanged.

## Verification

Use browser-computed layout measurements to verify `padding-top` and `padding-bottom`
are both `12px`, the first row starts `12px` below the wrapper top, and the wrapper ends
`12px` below the second row. Scroll the application content and confirm those values
remain stable while the toolbar is sticky. Run focused linting, the unit suite, and the
production build.
