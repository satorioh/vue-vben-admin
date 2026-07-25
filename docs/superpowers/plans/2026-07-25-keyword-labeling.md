# Keyword Labeling Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace coordinate-based keyword overlay elements with a semi-transparent red background applied directly to matched OCR text elements.

**Architecture:** Keep character-level keyword matching and circular navigation. Map every match back to its unique OCR location indexes, add a stable location index to each generated `.ocr-text` element, and toggle one CSS class on those existing elements.

**Tech Stack:** Vue 3 Composition API, TypeScript, Vitest, Element Plus, SCSS

## Global Constraints

- Do not change the `/py-api/ocr/recognize_bbox` request flow.
- Preserve OCR border display, drag selection, copy behavior, result counts, and circular navigation.
- Do not render separate keyword highlight elements.
- Highlight an entire OCR element when any part of its text matches.
- Use exactly `rgba(255, 0, 0, 0.5)` as the keyword background.
- Do not add a special current-match outline or color.

---

## File Map

- Modify `src/views/demo/feat/keyword-labeling/keywordData.ts`: expose unique OCR location indexes for a match and remove obsolete highlight-segment generation.
- Modify `src/views/demo/feat/keyword-labeling/__test__/keywordData.test.ts`: cover location-index deduplication and remove segment-coordinate assertions.
- Modify `src/views/demo/feat/keyword-labeling/index.vue`: remove overlay rendering and apply a class directly to `.ocr-text`.

### Task 1: Map Matches to OCR Elements

**Files:**
- Modify: `src/views/demo/feat/keyword-labeling/keywordData.ts`
- Test: `src/views/demo/feat/keyword-labeling/__test__/keywordData.test.ts`

**Interfaces:**
- Consumes: `KeywordMatch.characters[].locationIndex`
- Produces: `getMatchLocationIndexes(match: KeywordMatch): number[]`

- [ ] **Step 1: Write the failing location-index test**

Replace the obsolete highlight-segment test with:

```ts
it('returns unique OCR location indexes for a partial multi-character match', () => {
  const data = buildKeywordData(locations);
  const [match] = findKeywordMatches(data, '付款承');

  expect(getMatchLocationIndexes(match)).toEqual([0, 1]);
});
```

Import `getMatchLocationIndexes` from `../keywordData` and remove the `buildHighlightSegments` import.

- [ ] **Step 2: Run the focused test and verify RED**

```bash
corepack pnpm test src/views/demo/feat/keyword-labeling/__test__/keywordData.test.ts
```

Expected: FAIL because `getMatchLocationIndexes` is not exported.

- [ ] **Step 3: Implement the minimal mapping**

Add:

```ts
export function getMatchLocationIndexes(match: KeywordMatch): number[] {
  return [...new Set(match.characters.map(({ locationIndex }) => locationIndex))];
}
```

Delete the unused `HighlightSegment` interface and `buildHighlightSegments` function.

- [ ] **Step 4: Run focused and complete tests**

```bash
corepack pnpm test src/views/demo/feat/keyword-labeling/__test__/keywordData.test.ts
corepack pnpm test
```

Expected: all tests pass.

### Task 2: Apply Highlight Class to OCR Text

**Files:**
- Modify: `src/views/demo/feat/keyword-labeling/index.vue`

**Interfaces:**
- Consumes: `getMatchLocationIndexes(match)`
- Produces: `.ocr-text.keyword-highlight` elements with no separate overlay DOM

- [ ] **Step 1: Remove overlay rendering**

Delete the `v-for="highlight in keywordHighlights"` block from the template. Remove `CSSProperties`, `buildHighlightSegments`, the `keywordHighlights` computed value, and scoped `.keyword-highlight` overlay styles.

- [ ] **Step 2: Give OCR elements stable indexes**

Change OCR generation to use `(ocr, locationIndex)` and set:

```ts
div.setAttribute('data-location-index', String(locationIndex));
```

- [ ] **Step 3: Apply and clear match classes**

Add helpers that remove `.keyword-highlight` from all OCR elements and then add it to every unique location returned by `getMatchLocationIndexes`:

```ts
const clearKeywordHighlightClasses = () => {
  document.querySelectorAll('.ocr-text.keyword-highlight').forEach((element) => {
    element.classList.remove('keyword-highlight');
  });
};
```

Call the apply helper after matching and after `setOcrTextDiv()` recreates OCR elements. Call the clear helper before resetting `keywordMatches`.

- [ ] **Step 4: Navigate using the matched OCR element**

For `currentMatchIndex`, get its first location index and query:

```ts
`.ocr-text[data-location-index="${locationIndex}"]`
```

Keep the existing circular index calculation and `scrollIntoView` options.

- [ ] **Step 5: Add the direct highlight style**

Add the global rule:

```css
.ocr-text.keyword-highlight {
  background-color: rgba(255, 0, 0, 0.5);
}
```

Do not add text, outlines, extra positioning, or z-index rules for keyword highlighting.

- [ ] **Step 6: Run static and production validation**

```bash
corepack pnpm eslint src/views/demo/feat/keyword-labeling/index.vue src/views/demo/feat/keyword-labeling/keywordData.ts src/views/demo/feat/keyword-labeling/__test__/keywordData.test.ts
corepack pnpm test
corepack pnpm exec vite build
```

Expected: all commands exit 0.

- [ ] **Step 7: Verify in the browser**

Upload and recognize an image, then verify:

1. Searching a repeated Chinese keyword marks the existing `.ocr-text` elements red.
2. No separate `.keyword-highlight` elements exist outside `.ocr-text`.
3. A partial match inside a multi-character OCR item highlights the whole item.
4. Previous and next navigation still wrap.
5. Clearing the keyword or uploading another file removes the red background.
6. Border display and drag selection remain usable.

- [ ] **Step 8: Commit**

```bash
git add src/views/demo/feat/keyword-labeling/index.vue src/views/demo/feat/keyword-labeling/keywordData.ts src/views/demo/feat/keyword-labeling/__test__/keywordData.test.ts docs/superpowers/plans/2026-07-25-keyword-labeling.md
git commit -m "refactor(keyword-labeling): simplify highlight rendering"
```
