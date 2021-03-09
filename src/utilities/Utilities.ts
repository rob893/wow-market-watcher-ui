export class Utilities {
  public static isNumeric(value: unknown): boolean {
    return !Number.isNaN(Number(value));
  }

  public static splitAtUpperCase(str: string): string {
    return str.replace(/([A-Z])/g, ' $1').trim();
  }

  public static removeItemFromArray<T>(arr: T[], item: T): boolean {
    const index = arr.indexOf(item);

    if (index >= 0) {
      arr.splice(index, 1);
      return true;
    }

    return false;
  }

  public static clearObject(obj: Record<string, unknown>): void {
    Object.keys(obj).forEach(key => delete obj[key]);
  }

  public static isEmptyObject(obj: Record<string, unknown>): boolean {
    return Object.keys(obj).length === 0;
  }

  public static formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  }

  public static wait(ms: number): Promise<void> {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }

  public static hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        }
      : null;
  }

  public static rgbToHex(r: number, g: number, b: number): string {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
}
