import { describe, expect, it } from 'vitest';

import { buildHighlightSegments, buildKeywordData, findKeywordMatches } from '../keywordData';

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
