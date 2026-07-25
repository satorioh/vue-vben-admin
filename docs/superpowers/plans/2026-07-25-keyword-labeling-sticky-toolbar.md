# Keyword Labeling Sticky Toolbar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the OCR recognition and keyword labeling toolbars together at the top of the application content while the preview page scrolls.

**Architecture:** Add one semantic wrapper around the two existing toolbar rows and make that wrapper sticky with CSS. Rely on the existing `.vben-layout-content` scroll container; do not add scroll listeners or change OCR, keyword matching, or navigation state.

**Tech Stack:** Vue 3 SFC, TypeScript, SCSS, Element Plus, Vitest, Vite

## Global Constraints

- Preserve the existing `ocr-recognize-toolbar` and `keyword-labeling-toolbar` class names and two-row order.
- Use CSS `position: sticky` with `top: 0`; do not add JavaScript scroll handling.
- Use an opaque application-content background and a z-index above preview overlays.
- Do not change recognition, upload, keyword matching, navigation, selection, or border-toggle behavior.
- Use `corepack pnpm` because the repository requires pnpm 9.

---

### Task 1: Make the toolbar group sticky

**Files:**
- Modify: `src/views/demo/feat/keyword-labeling/index.vue:2-37`
- Modify: `src/views/demo/feat/keyword-labeling/index.vue:548-570`

**Interfaces:**
- Consumes: the existing `.vben-layout-content` vertical scroll container and both toolbar row classes.
- Produces: one `.keyword-labeling-sticky-toolbar` element containing both toolbar rows.

- [ ] **Step 1: Establish the failing browser acceptance check**

Start the application:

```bash
corepack pnpm exec vite --host 127.0.0.1
```

Open `http://127.0.0.1:5173/#/feat/keywordLabeling` and evaluate:

```js
({
  wrapperCount: document.querySelectorAll('.keyword-labeling-sticky-toolbar').length,
  position: getComputedStyle(
    document.querySelector('.keyword-labeling-sticky-toolbar') ?? document.body,
  ).position,
})
```

Expected before implementation:

```js
{ wrapperCount: 0, position: 'static' }
```

- [ ] **Step 2: Add the shared wrapper**

Wrap the existing toolbar rows without changing their contents:

```vue
<div class="keyword-labeling-sticky-toolbar">
  <div class="flex mb-4 ocr-recognize-toolbar">
    <!-- existing upload, recognition, and border controls -->
  </div>
  <div class="keyword-labeling-toolbar">
    <!-- existing keyword and navigation controls -->
  </div>
</div>
```

- [ ] **Step 3: Add the minimal sticky styles**

Add this rule inside `.keyword-labeling-demo-page`:

```scss
.keyword-labeling-sticky-toolbar {
  position: sticky;
  z-index: 10;
  top: 0;
  background-color: var(--app-content-background-color);
}
```

Keep the existing `.keyword-labeling-toolbar` spacing and layout rules unchanged.

- [ ] **Step 4: Run focused static validation**

Run:

```bash
corepack pnpm exec eslint src/views/demo/feat/keyword-labeling/index.vue
git diff --check
```

Expected: both commands exit with status 0.

- [ ] **Step 5: Verify sticky behavior in the browser**

Load a tall OCR preview, record the wrapper top position, scroll `.vben-layout-content`,
and evaluate:

```js
const scrollContainer = document.querySelector('.vben-layout-content');
const toolbar = document.querySelector('.keyword-labeling-sticky-toolbar');
scrollContainer.scrollTop = Math.min(800, scrollContainer.scrollHeight);

({
  wrapperCount: document.querySelectorAll('.keyword-labeling-sticky-toolbar').length,
  position: getComputedStyle(toolbar).position,
  top: getComputedStyle(toolbar).top,
  toolbarTop: Math.round(toolbar.getBoundingClientRect().top),
  contentTop: Math.round(scrollContainer.getBoundingClientRect().top),
  rowsVisible:
    document.querySelector('.ocr-recognize-toolbar').getBoundingClientRect().height > 0 &&
    document.querySelector('.keyword-labeling-toolbar').getBoundingClientRect().height > 0,
})
```

Expected: `wrapperCount` is `1`, `position` is `sticky`, `top` is `0px`,
`toolbarTop` equals `contentTop`, and `rowsVisible` is `true`. Click “上一处” and
“下一处” after scrolling and confirm both remain interactive. Browser error logs must be
empty.

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
git commit -m "style(keyword-labeling): keep toolbars visible on scroll"
```
