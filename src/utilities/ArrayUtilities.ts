export class ArrayUtilities {
  public static removeItem<T>(arr: T[], item: T): boolean {
    const index = arr.indexOf(item);

    if (index >= 0) {
      arr.splice(index, 1);
      return true;
    }

    return false;
  }

  public static removeRange<T>(arr: T[], items: T[]): boolean {
    let success = false;

    items.forEach(item => {
      success = this.removeItem(arr, item);
    });

    return success;
  }

  public static removeWhere<T>(arr: T[], condition: (item: T) => boolean): boolean {
    let success = false;
    const itemsToRemove: T[] = [];

    arr.forEach(item => {
      if (condition(item)) {
        itemsToRemove.push(item);
      }
    });

    itemsToRemove.forEach(item => {
      success = this.removeItem(arr, item);
    });

    return success;
  }

  public static sortAsc<T>(arr: T[]): T[] {
    return arr.sort((a, b) => {
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      } else {
        return 0;
      }
    });
  }

  public static getRandomElement<T>(array: T[]): T | null {
    if (array.length === 0) {
      return null;
    }

    return array[Math.floor(Math.random() * array.length)];
  }
}

export class Comparer {
  public static dateAscending(a: string | number, b: string | number): number {
    return new Date(a).getTime() - new Date(b).getTime();
  }

  public static dateDescending(a: string | number, b: string | number): number {
    return new Date(b).getTime() - new Date(a).getTime();
  }
}
