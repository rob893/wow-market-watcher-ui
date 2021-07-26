import { ArrayUtilities } from './ArrayUtilities';

export class MathUtilities {
  public static sum(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0);
  }

  public static mean(arr: number[]): number {
    return this.sum(arr) / arr.length;
  }

  public static std(arr: number[]): number {
    const mu = this.mean(arr);
    const diffArr = arr.map(a => (a - mu) ** 2);
    return Math.sqrt(this.sum(diffArr) / (arr.length - 1));
  }

  public static quantile(arr: number[], q: number): number {
    const sorted = ArrayUtilities.sortAsc<number>(arr);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  }

  public static q25(arr: number[]): number {
    return this.quantile(arr, 0.25);
  }

  public static q50(arr: number[]): number {
    return this.quantile(arr, 0.5);
  }

  public static q75(arr: number[]): number {
    return this.quantile(arr, 0.75);
  }

  public static q95(arr: number[]): number {
    return this.quantile(arr, 0.95);
  }

  public static percentRank(arr: number[], value: number): number {
    const sorted = ArrayUtilities.sortAsc([...arr]);

    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i] === value) {
        return i / (sorted.length - 1);
      }
    }

    // calculate value using linear interpolation
    let x1, x2, y1, y2;

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i] < value && value < sorted[i + 1]) {
        x1 = sorted[i];
        x2 = sorted[i + 1];
        y1 = this.percentRank(sorted, x1);
        y2 = this.percentRank(sorted, x2);
        return ((x2 - value) * y1 + (value - x1) * y2) / (x2 - x1);
      }
    }

    throw new Error('Out of bounds');
  }
}
