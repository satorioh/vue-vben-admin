import { describe, expect, it } from 'vitest';

import {
  buildKeywordData,
  findKeywordMatches,
  getCircularMatchIndex,
  getMatchLocationIndexes,
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

  it('returns unique OCR location indexes for a partial multi-character match', () => {
    const [match] = findKeywordMatches(buildKeywordData(locations), '付款承');

    expect(getMatchLocationIndexes(match)).toEqual([0, 1]);
  });

  it('wraps match navigation at both ends', () => {
    expect(getCircularMatchIndex(2, 1, 3)).toBe(0);
    expect(getCircularMatchIndex(0, -1, 3)).toBe(2);
    expect(getCircularMatchIndex(0, 1, 0)).toBe(-1);
  });
});
