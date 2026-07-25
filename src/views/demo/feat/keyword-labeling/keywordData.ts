export interface OcrLocationItem {
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

export interface KeywordCharacter {
  text: string;
  locationIndex: number;
  characterIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface KeywordData {
  text: string;
  characters: KeywordCharacter[];
}

export interface KeywordMatch {
  start: number;
  end: number;
  characters: KeywordCharacter[];
}

export function buildKeywordData(locations: OcrLocationItem[]): KeywordData {
  const characters = locations.flatMap((location, locationIndex) => {
    const texts = Array.from(location.text);
    const characterWidth = texts.length ? location.width / texts.length : 0;

    return texts.map((text, characterIndex) => ({
      text,
      locationIndex,
      characterIndex,
      x: location.x + characterWidth * characterIndex,
      y: location.y,
      width: characterWidth,
      height: location.height,
    }));
  });

  return {
    text: characters.map(({ text }) => text).join(''),
    characters,
  };
}

export function findKeywordMatches(data: KeywordData, keyword: string): KeywordMatch[] {
  const keywordCharacters = Array.from(keyword);
  if (!keywordCharacters.length) return [];

  const matches: KeywordMatch[] = [];
  const lastStart = data.characters.length - keywordCharacters.length;

  for (let start = 0; start <= lastStart; start += 1) {
    const isMatch = keywordCharacters.every(
      (text, offset) => data.characters[start + offset]?.text === text,
    );
    if (!isMatch) continue;

    matches.push({
      start,
      end: start + keywordCharacters.length,
      characters: data.characters.slice(start, start + keywordCharacters.length),
    });
  }

  return matches;
}

export function getCircularMatchIndex(currentIndex: number, step: number, total: number): number {
  if (total === 0) return -1;
  return (currentIndex + step + total) % total;
}

export function getMatchLocationIndexes(match: KeywordMatch): number[] {
  return [...new Set(match.characters.map(({ locationIndex }) => locationIndex))];
}
