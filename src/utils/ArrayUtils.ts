export abstract class ArrayUtils {
  /**
   * Filter a collection by removing elements that have every property similar.
   * @param arr the collection to filter
   */
  static removeDuplicate<T extends Record<never, unknown>>(arr: T[]): T[] {
    return [...new Map(arr.map((v) => [JSON.stringify(v), v])).values()]
  }
}
