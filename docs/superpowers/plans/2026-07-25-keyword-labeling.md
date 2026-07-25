# Keyword Labeling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add exact keyword matching, yellow coordinate-based highlights, result counts, and circular previous/next navigation to the OCR keyword-labeling demo.

**Architecture:** Keep OCR upload, text boxes, selection, and copy behavior unchanged. A focused pure TypeScript module converts OCR locations into character-level coordinates and finds overlapping matches; `index.vue` owns toolbar state and declaratively renders match overlays using the existing preview scale.

**Tech Stack:** Vue 3 Composition API, TypeScript, Element Plus, Vitest, Vite, SCSS

## Global Constraints

- Do not change the `/py-api/ocr/recognize_bbox` request flow.
- Preserve OCR border display, drag selection, and copy behavior.
- Match literal text exactly and allow overlapping results.
- Approximate missing character coordinates by evenly dividing a multi-character OCR box.
- Previous and next navigation wrap at the first and last result.
- All matches use a yellow background and black text; the current match also has a distinct outline.

---

## File Map

- Create `src/views/demo/feat/keyword-labeling/keywordData.ts`: OCR character mapping, matching, and highlight-segment generation.
- Create `src/views/demo/feat/keyword-labeling/__test__/keywordData.test.ts`: unit coverage for the pure matching module.
- Modify `src/views/demo/feat/keyword-labeling/index.vue`: toolbar, state transitions, overlay rendering, and circular navigation.
- Modify `package.json` and `pnpm-lock.yaml`: expose the existing Vitest-style tests through a root `test` script and install Vitest.

### Task 1: Character-Level OCR Matching

**Files:**
- Create: `src/views/demo/feat/keyword-labeling/keywordData.ts`
- Create: `src/views/demo/feat/keyword-labeling/__test__/keywordData.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**
- Produces: `buildKeywordData(locations: OcrLocationItem[]): KeywordData`
- Produces: `findKeywordMatches(data: KeywordData, keyword: string): KeywordMatch[]`
- Produces: `buildHighlightSegments(match: KeywordMatch): HighlightSegment[]`
- `KeywordData` contains `text: string` and `characters: KeywordCharacter[]`.
- `HighlightSegment` contains `locationIndex`, `text`, `x`, `y`, `width`, and `height`.

- [ ] **Step 1: Install and expose the test runner**

Run:

```bash
pnpm add -D vitest
```

Add to `package.json` scripts:

```json
"test": "vitest run"
```

- [ ] **Step 2: Write failing character-mapping tests**

Create tests using these cases:

```ts
import { describe, expect, it } from 'vitest';
import {
  buildHighlightSegments,
  buildKeywordData,
  findKeywordMatches,
} from '../keywordData';

const locations = [
  { text: '付款', x: 10, y: 20, width: 40, height: 12 },
  { text: '承', x: 50, y: 20, width: 20, height: 12 },
  { text: '诺', x: 70, y: 20, width: 20, height: 12 },
];

describe('keywordData', () => {
  it('maps every character to an evenly divided OCR coordinate', () => {
    const data = buildKeywordData(locations);
    expect(data.text).toBe('付款承诺');
    expect(data.characters[1]).toMatchObject({
      text: '款',
      locationIndex: 0,
      characterIndex: 1,
      x: 30,
      width: 20,
    });
  });

  it('finds a keyword spanning OCR locations', () => {
    const matches = findKeywordMatches(buildKeywordData(locations), '款承');
    expect(matches).toHaveLength(1);
    expect(matches[0].characters.map(({ text }) => text)).toEqual(['款', '承']);
  });

  it('finds overlapping matches', () => {
    const data = buildKeywordData([{ text: '哈哈哈', x: 0, y: 0, width: 30, height: 10 }]);
    expect(findKeywordMatches(data, '哈哈')).toHaveLength(2);
  });

  it('returns no matches for an empty keyword', () => {
    expect(findKeywordMatches(buildKeywordData(locations), '')).toEqual([]);
  });

  it('merges adjacent matched characters from the same OCR location', () => {
    const [match] = findKeywordMatches(buildKeywordData(locations), '付款');
    expect(buildHighlightSegments(match)).toEqual([
      { locationIndex: 0, text: '付款', x: 10, y: 20, width: 40, height: 12 },
    ]);
  });
});
```

- [ ] **Step 3: Run the tests and verify the expected failure**

Run:

```bash
pnpm test src/views/demo/feat/keyword-labeling/__test__/keywordData.test.ts
```

Expected: FAIL because `../keywordData` does not exist.

- [ ] **Step 4: Implement the minimal pure module**

Define exported interfaces `OcrLocationItem`, `KeywordCharacter`, `KeywordData`, `KeywordMatch`, and `HighlightSegment`. Implement `buildKeywordData` with `Array.from(location.text)` so one mapping is created per Unicode character. Assign each character `width / characterCount`, and calculate `x + characterWidth * characterIndex`.

Implement `findKeywordMatches` by comparing `Array.from(keyword)` against `data.characters` at every possible start index. On equality, return `{ start, end, characters }`; advancing the start by one preserves overlaps.

Implement `buildHighlightSegments` by merging only characters with the same `locationIndex` and consecutive `characterIndex` values. The merged width is the sum of character widths and its `text` is the joined matched characters.

- [ ] **Step 5: Run focused and existing tests**

Run:

```bash
pnpm test src/views/demo/feat/keyword-labeling/__test__/keywordData.test.ts
pnpm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit the matching module**

```bash
git add package.json pnpm-lock.yaml src/views/demo/feat/keyword-labeling/keywordData.ts src/views/demo/feat/keyword-labeling/__test__/keywordData.test.ts
git commit -m "feat(keyword-labeling): add keyword matching model"
```

### Task 2: Toolbar, Highlight Rendering, and Navigation

**Files:**
- Modify: `src/views/demo/feat/keyword-labeling/index.vue:1-494`

**Interfaces:**
- Consumes: `buildKeywordData`, `findKeywordMatches`, `buildHighlightSegments`, `KeywordMatch`, and `HighlightSegment` from `./keywordData`.
- Produces: toolbar actions `labelKeyword`, `goToPreviousMatch`, `goToNextMatch`, and declarative `.keyword-highlight` overlays.

- [ ] **Step 1: Add toolbar and overlay markup**

Place the toolbar between the upload controls and `preview-container`:

```vue
<div class="keyword-labeling-toolbar">
  <el-input
    v-model="keyword"
    clearable
    placeholder="请输入关键字"
    @keyup.enter="labelKeyword"
  />
  <el-button type="primary" @click="labelKeyword">标注</el-button>
  <span>共找到 {{ keywordMatches.length }} 处</span>
  <el-button :disabled="!keywordMatches.length" @click="goToPreviousMatch">上一处</el-button>
  <el-button :disabled="!keywordMatches.length" @click="goToNextMatch">下一处</el-button>
</div>
```

Inside `preview-container`, render one absolute element per scaled highlight segment. Add `data-match-index`, a stable key, `keyword-highlight--current` for the active match, and the matched segment text so the overlay renders black characters over its yellow background.

- [ ] **Step 2: Add keyword state and derived data**

Import `computed` plus the pure-module interfaces and functions. Add:

```ts
const keyword = ref('');
const keywordMatches = ref<KeywordMatch[]>([]);
const currentMatchIndex = ref(-1);
const keywordData = computed(() => buildKeywordData(ocrData.value.locations));
```

Create a computed flattened overlay list. For each match, call `buildHighlightSegments`, attach its `matchIndex`, and calculate display coordinates from `previewWidth / originWidth` and `previewHeight / originHeight`. Preserve the existing OCR box `left` offset so overlay text and OCR text remain aligned.

- [ ] **Step 3: Implement labeling and circular navigation**

Implement `clearKeywordMatches()` to empty results and reset the current index. Implement `labelKeyword()` to trim only for the empty-input check, search using the original entered text, set the first result current, and navigate to it on `nextTick`.

Implement `navigateToMatch(index)` with:

```ts
currentMatchIndex.value =
  (index + keywordMatches.value.length) % keywordMatches.value.length;
```

After the DOM update, find the first element with the current `data-match-index` and call:

```ts
element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
```

Previous passes `currentMatchIndex - 1`; next passes `currentMatchIndex + 1`.

- [ ] **Step 4: Reset stale results at lifecycle boundaries**

Call `clearKeywordMatches()` when a new file is selected, immediately before a new OCR request, and when `clearOcrTextDiv(true)` clears OCR data. Watch `keyword`; when it becomes empty, clear results. Do not modify upload payloads, response parsing, OCR box creation, or selection event handlers.

- [ ] **Step 5: Add toolbar and highlight styles**

Add a single-line flex toolbar with spacing and a bounded input width. Style overlays with absolute positioning, `pointer-events: none`, yellow background, black text, matching line height, and a z-index above the preview but compatible with OCR selection. Give the current match an orange outline and higher z-index.

- [ ] **Step 6: Run static validation**

Run:

```bash
pnpm eslint src/views/demo/feat/keyword-labeling/index.vue src/views/demo/feat/keyword-labeling/keywordData.ts src/views/demo/feat/keyword-labeling/__test__/keywordData.test.ts
pnpm type:check
```

Expected: both commands exit 0.

- [ ] **Step 7: Commit the page integration**

```bash
git add src/views/demo/feat/keyword-labeling/index.vue
git commit -m "feat(keyword-labeling): add keyword highlight navigation"
```

### Task 3: Regression and Production Verification

**Files:**
- Verify: `src/views/demo/feat/keyword-labeling/index.vue`
- Verify: `src/views/demo/feat/keyword-labeling/keywordData.ts`
- Verify: `src/views/demo/feat/keyword-labeling/__test__/keywordData.test.ts`

**Interfaces:**
- Consumes: the complete keyword-labeling page.
- Produces: evidence that the feature and existing OCR interactions work together.

- [ ] **Step 1: Run the complete automated checks**

```bash
pnpm test
pnpm lint
pnpm type:check
pnpm build
```

Expected: every command exits 0 with no test failures, lint errors, type errors, or build errors.

- [ ] **Step 2: Perform browser verification**

Run `pnpm dev`, open `/feat/keywordLabeling`, and verify:

1. Upload and recognize a file without changing the OCR request.
2. Search a Chinese phrase spanning multiple OCR boxes; all occurrences become yellow with black text.
3. Search part of `CNH-VA2025030700401`; only the approximate substring region is highlighted.
4. Confirm the count matches visible occurrences.
5. Navigate past both ends and confirm circular wrapping.
6. Resize the viewport and confirm highlights remain aligned.
7. Toggle borders, drag-select OCR text, and copy it successfully.
8. Upload another file and confirm old highlights disappear.

- [ ] **Step 3: Review the final diff**

```bash
git diff HEAD~2 --check
git diff HEAD~2 --stat
git status --short
```

Expected: no whitespace errors and no unrelated files.
