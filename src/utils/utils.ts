
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







/* Generators */


const getArrayGenerator = (arr: any[]) => function* (start: any = 0, end: any = arr.length): IterableIterator<any> {
  if (start === undefined) return arr;
  if (end === undefined && start > -1) {
    end = start - 1;
    start = 0;
  }
  if (end === 'tail') return arr.slice(start);
  if (start > -1) end = end + 1;
  yield* arr.slice(start, end);
};



class SimpleGenerator {

  * generateNumber(count: number): IterableIterator<number> {
    while(true)
      yield count++;
  }

  * generateString(): IterableIterator<string> {
    yield 'one';
    yield 'two';
    yield 'three';
    yield 'four';
    yield 'five';
  }

  * generateArray(items: any[]): IterableIterator<string> {
    while (true) yield* items;
  }

}



const generatorDemo = () => {

  let simpleGenerator = new SimpleGenerator();
  let stringGenerator = simpleGenerator.generateString();
  let numberGenerator = simpleGenerator.generateNumber(10);

  let arr = [
    {one:1, two:2, three:3},
    {one:1, two:2, three:3},
    {one:1, two:2, three:3},
    {one:1, two:2, three:3},
  ]

  let arrayGenerator = getArrayGenerator(arr)();
  let next = arrayGenerator.next();
  for (let i = 0; i < 20; i++) {
    if (next.done) break;
    console.log(next.value);
    next = arrayGenerator.next();
  }

}



