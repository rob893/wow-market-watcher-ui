export class Utilities {
  public static isNumeric(value: unknown): boolean {
    return !Number.isNaN(Number(value));
  }

  public static splitAtUpperCase(str: string): string {
    return str.replace(/([A-Z])/g, ' $1').trim();
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

  public static insert(str: string, index: number, value: string): string {
    return str.substr(0, index) + value + str.substr(index);
  }

  public static convertToGoldSilverCopper(copper: number): { g: number; s: number; c: number } {
    const c = copper % 100;
    const silver = copper / 100;
    const s = silver % 100;
    const g = silver / 100;

    return {
      g,
      s,
      c
    };
  }
}
