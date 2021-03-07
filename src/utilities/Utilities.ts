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
}
