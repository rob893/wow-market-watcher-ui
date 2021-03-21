import { OrderByOptions } from '@/models';

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

  public static orderBy<T>(array: T[], orderByOptions: OrderByOptions<T>): T[] {
    const { orderBy, comparer, direction } = orderByOptions;

    if (comparer) {
      array.sort((a, b) => comparer(a[orderBy], b[orderBy]));
    } else {
      array.sort((a, b) => {
        if (direction === 'Descending') {
          if (a[orderBy] < b[orderBy]) {
            return 1;
          } else if (a[orderBy] > b[orderBy]) {
            return -1;
          } else {
            return 0;
          }
        }

        if (a[orderBy] > b[orderBy]) {
          return 1;
        } else if (a[orderBy] < b[orderBy]) {
          return -1;
        } else {
          return 0;
        }
      });
    }

    return array;
  }

  public static shuffle<T>(array: T[]): T[] {
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

    return array;
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
