# Keyword Labeling Sticky Toolbar Spacing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the sticky toolbar group exactly `12px` of visible internal space above and below its two rows.

**Architecture:** Correct the wrapper's CSS box model instead of adding scroll-state logic. Add vertical padding to the sticky wrapper, remove the keyword row's collapsing bottom margin, and retain the recognition row's existing `16px` inter-row spacing.

**Tech Stack:** Vue 3 SFC, SCSS, Element Plus, Vitest, Vite

## Global Constraints

- `.keyword-labeling-sticky-toolbar` must have `12px` top and bottom padding.
- `.keyword-labeling-toolbar` must have no bottom margin inside the wrapper.
- Preserve the recognition row's existing `mb-4` class and `16px` inter-row gap.
- Preserve sticky positioning, opaque background, z-index, and all business behavior.
- Do not add JavaScript scroll listeners or sticky-state classes.
- Use `corepack pnpm` because the repository requires pnpm 9.

---

### Task 1: Correct the sticky toolbar box model

**Files:**
- Modify: `src/views/demo/feat/keyword-labeling/index.vue:550-570`

**Interfaces:**
- Consumes: `.keyword-labeling-sticky-toolbar`, `.ocr-recognize-toolbar`, and `.keyword-labeling-toolbar`.
- Produces: stable `12px` top and bottom internal gaps in both normal and sticky states.

- [ ] **Step 1: Establish the failing browser acceptance check**

Start the application:

```bash
corepack pnpm exec vite --host 127.0.0.1
```

Open `http://127.0.0.1:5173/#/feat/keywordLabeling` and evaluate the wrapper:

```js
const wrapper = document.querySelector('.keyword-labeling-sticky-toolbar');
const firstRow = wrapper.querySelector('.ocr-recognize-toolbar');
const secondRow = wrapper.querySelector('.keyword-labeling-toolbar');
const wrapperRect = wrapper.getBoundingClientRect();
const firstRect = firstRow.getBoundingClientRect();
const secondRect = secondRow.getBoundingClientRect();
const style = getComputedStyle(wrapper);

({
  paddingTop: style.paddingTop,
  paddingBottom: style.paddingBottom,
  topGap: firstRect.top - wrapperRect.top,
  bottomGap: wrapperRect.bottom - secondRect.bottom,
})
```

Expected before implementation:

```js
{ paddingTop: '0px', paddingBottom: '0px', topGap: 0, bottomGap: 0 }
```

- [ ] **Step 2: Add exact wrapper padding**

Update the existing wrapper rule:

```scss
.keyword-labeling-sticky-toolbar {
  position: sticky;
  z-index: 10;
  top: 0;
  padding: 12px 0;
  background-color: var(--app-content-background-color);
}
```

- [ ] **Step 3: Remove the collapsing bottom margin**

Update the existing keyword row rule:

```scss
.keyword-labeling-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 0;
  white-space: nowrap;
}
```

Do not change the recognition row's `mb-4` class.

- [ ] **Step 4: Run focused static validation**

Run:

```bash
corepack pnpm exec prettier --check src/views/demo/feat/keyword-labeling/index.vue
corepack pnpm exec eslint src/views/demo/feat/keyword-labeling/index.vue
git diff --check
```

Expected: all commands exit with status 0.

- [ ] **Step 5: Verify the box model before and after scrolling**

Load the demo OCR image so `.vben-layout-content` can scroll. Run the Step 1 measurement
before scrolling and again after scrolling to the bottom.

Expected in both states:

```js
{
  paddingTop: '12px',
  paddingBottom: '12px',
  topGap: 12,
  bottomGap: 12,
}
```

Also verify:

```js
({
  position: getComputedStyle(wrapper).position,
  top: getComputedStyle(wrapper).top,
  backgroundColor: getComputedStyle(wrapper).backgroundColor,
  zIndex: getComputedStyle(wrapper).zIndex,
})
```

Expected: `position` is `sticky`, `top` is `0px`, the background is opaque, and `zIndex`
is `10`. Browser error logs must be empty.

- [ ] **Step 6: Run regression verification**

Run:

```bash
corepack pnpm test
corepack pnpm exec vite build
```

Expected: all tests pass and the production build exits with status 0. Existing dependency,
chunk-size, and circular-chunk warnings are acceptable.

- [ ] **Step 7: Commit the implementation**

```bash
git add src/views/demo/feat/keyword-labeling/index.vue
git commit -m "fix(keyword-labeling): restore sticky toolbar spacing"
```
