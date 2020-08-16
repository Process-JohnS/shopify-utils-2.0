
export class ResourceIterator<T> implements Iterator<T> {
  protected pointer: number = 0;

  constructor(public components: T[]) {}

  public next(): IteratorResult<T> {
    return this.pointer < this.components.length ? {
      done: false,
      value: this.components[this.pointer++]
    } : {
      done: true,
      value: null
    };
  }

  public [Symbol.iterator] = (): IterableIterator<T> => this;
}
