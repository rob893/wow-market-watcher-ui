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

  public static orderBy<T extends object>(array: T[], orderByOptions: OrderByOptions<T>): T[];
  public static orderBy<T extends object>(
    array: T[],
    selector: (item: T) => string | number | boolean,
    orderByOptions?: Omit<OrderByOptions<T>, 'orderBy' | 'comparer'>
  ): T[];
  public static orderBy<T extends object>(
    array: T[],
    orderByOptionsOrSelector: OrderByOptions<T> | ((item: T) => string | number | boolean),
    orderByOptions?: Omit<OrderByOptions<T>, 'orderBy' | 'comparer'>
  ): T[] {
    if (typeof orderByOptionsOrSelector === 'function') {
      const { direction } = orderByOptions ?? {};

      array.sort((a, b) => {
        if (direction === 'Descending') {
          if (orderByOptionsOrSelector(a) < orderByOptionsOrSelector(b)) {
            return 1;
          } else if (orderByOptionsOrSelector(a) > orderByOptionsOrSelector(b)) {
            return -1;
          } else {
            return 0;
          }
        }

        if (orderByOptionsOrSelector(a) > orderByOptionsOrSelector(b)) {
          return 1;
        } else if (orderByOptionsOrSelector(a) < orderByOptionsOrSelector(b)) {
          return -1;
        } else {
          return 0;
        }
      });
    } else {
      const { orderBy, comparer, direction } = orderByOptionsOrSelector;

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
