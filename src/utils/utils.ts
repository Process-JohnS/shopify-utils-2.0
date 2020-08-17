
import split from 'split-string';
import * as levenshtein from 'fast-levenshtein';



export const wait = (ms: number) => {
  let start = new Date().getTime(), end = start;
  while (end < start + ms) end = new Date().getTime();
};

export const splitCSVLine = (line: string) => {
  return split(line, { separator: ',', quotes: ['"'], keep: (value: string, state: any) => {
    return value !== '\\' && (value !== '"' || state.prev() === '\\');
  }});
}

export const getSimilarityRating = (a: string, b: string): number => {
  return levenshtein.get(a, b);
}
