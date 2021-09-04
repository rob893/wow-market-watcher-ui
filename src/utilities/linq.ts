export function linq<T>(src: Iterable<T>): Enumerable<T> {
  return new Enumerable(src);
}

export class Enumerable<T> implements Iterable<T> {
  private readonly src: Iterable<T>;

  public constructor(src: Iterable<T>) {
    this.src = src;
  }

  public *[Symbol.iterator](): Generator<T> {
    for (const item of this.src) {
      yield item;
    }
  }

  public forEach(callback: (item: T) => void): void {
    for (const item of this.src) {
      callback(item);
    }
  }

  public where(exp: (item: T) => boolean): Enumerable<T> {
    const found: T[] = [];

    for (const item of this.src) {
      if (exp(item)) {
        found.push(item);
      }
    }

    return new Enumerable(found);
  }

  public aggregate<T>(aggregator: (prev: T, curr: T) => T): T;
  public aggregate<TAccumulate>(
    seed: TAccumulate,
    aggregator: (prev: TAccumulate, curr: T) => TAccumulate
  ): TAccumulate;
  public aggregate<TAccumulate extends object>(
    seedOrAggregator: TAccumulate | ((prev: T, curr: T) => T),
    aggregator?: (prev: TAccumulate, curr: T) => TAccumulate
  ): TAccumulate | T {
    if (typeof seedOrAggregator === 'function') {
      if (!this.any()) {
        throw new Error('Sequence contains no elements');
      }

      return this.aggregate(this.first(), seedOrAggregator);
    }

    if (!aggregator) {
      throw new Error('Invalid use of overloads.');
    }

    let aggregate = seedOrAggregator;

    for (const item of this.src) {
      aggregate = aggregator(aggregate, item);
    }

    return aggregate;
  }

  public orderBy(selector: (item: T) => string | number | boolean): Enumerable<T> {
    const sorted = this.toArray().sort((a, b) => {
      const aComp = selector(a);
      const bComp = selector(b);

      if (aComp > bComp) {
        return 1;
      } else if (aComp < bComp) {
        return -1;
      } else {
        return 0;
      }
    });

    return new Enumerable(sorted);
  }

  public orderByDescending(selector: (item: T) => string | number | boolean): Enumerable<T> {
    const sorted = this.toArray().sort((a, b) => {
      const aComp = selector(a);
      const bComp = selector(b);

      if (aComp < bComp) {
        return 1;
      } else if (aComp > bComp) {
        return -1;
      } else {
        return 0;
      }
    });

    return new Enumerable(sorted);
  }

  public count(condition?: (item: T) => boolean): number {
    if (condition) {
      let matches = 0;

      for (const item of this.src) {
        if (condition(item)) {
          matches++;
        }
      }

      return matches;
    }

    if (this.src instanceof Array || this.src instanceof String) {
      return this.src.length;
    } else if (this.src instanceof Set || this.src instanceof Map) {
      return this.src.size;
    }

    let count = 0;

    this.forEach(() => {
      count++;
    });

    return count;
  }

  public any(condition?: (item: T) => boolean): boolean {
    if (!condition) {
      return this.count() > 0;
    }

    for (const item of this.src) {
      if (condition(item)) {
        return true;
      }
    }

    return false;
  }

  public all(condition: (item: T) => boolean): boolean {
    for (const item of this.src) {
      if (!condition(item)) {
        return false;
      }
    }

    return true;
  }

  public first(condition?: (item: T) => boolean): T {
    for (const item of this.src) {
      if (!condition) {
        return item;
      } else if (condition(item)) {
        return item;
      }
    }

    throw new Error('Sequence contains no elements.');
  }

  public firstOrDefault(condition?: (item: T) => boolean): T | null {
    for (const item of this.src) {
      if (!condition) {
        return item;
      } else if (condition(item)) {
        return item;
      }
    }

    return null;
  }

  public sum(selector: (item: T) => number): number {
    return this.aggregate(0, (prev, curr) => prev + selector(curr));
  }

  public max(selector: (item: T) => number): T {
    return this.aggregate((prev, curr) => (selector(prev) > selector(curr) ? prev : curr));
  }

  public min(selector: (item: T) => number): T {
    return this.aggregate((prev, curr) => (selector(prev) < selector(curr) ? prev : curr));
  }

  public average(selector: (item: T) => number): number {
    return this.sum(selector) / this.count();
  }

  public quantile(selector: (item: T) => number, q: number): number {
    const sorted = this.select(selector)
      .orderBy(x => x)
      .toArray();
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  }

  public select<TDestination>(exp: (item: T) => TDestination): Enumerable<TDestination> {
    const mapped: TDestination[] = [];

    for (const item of this.src) {
      mapped.push(exp(item));
    }

    return new Enumerable(mapped);
  }

  public selectMany<TDestination extends []>(exp: (item: T) => TDestination[]): Enumerable<TDestination> {
    const mapped: TDestination[] = [];

    for (const item of this.src) {
      mapped.push(...exp(item));
    }

    return new Enumerable(mapped);
  }

  public toMap<TKey>(keySelector: (item: T) => TKey): Map<TKey, T> {
    const map = new Map<TKey, T>();

    for (const item of this.src) {
      const key = keySelector(item);
      map.set(key, item);
    }

    return map;
  }

  public toSet(): Set<T> {
    return new Set(this.src);
  }

  public toArray(): T[] {
    return [...this.src];
  }

  public shuffle(): Enumerable<T> {
    const array = [...this.src];
    let currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return new Enumerable(array);
  }

  public distinct<TKey>(selector?: (item: T) => TKey): Enumerable<T> {
    if (!selector) {
      return new Enumerable(new Set(this.src));
    }

    const seenKeys = new Set<TKey>();
    const distictItems: T[] = [];

    for (const item of this.src) {
      const key = selector(item);

      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        distictItems.push(item);
      }
    }

    return new Enumerable(distictItems);
  }
}
