export abstract class ArrayUtils {
  /**
   * Filter a collection by removing elements that have every property similar.
   * @param arr the collection to filter
   */
  static removeDuplicate<T extends Record<never, unknown>>(arr: T[]): T[] {
    return [...new Map(arr.map((v) => [JSON.stringify(v), v])).values()]
  }

  /**
   * TODO
   * @param list
   * @param size
   */
  static getSample(list: string[], size: number): string[] {
    if (list.length <= size) {
      return list
    }

    const sortedList = list.sort()
    // TODO could be improved to take the more distinct element
    // TODO could probably me more elegant
    const n = Math.round(Number(list.length / size))
    const curatedList = []
    for (let i = 0; i < size; i++) {
      curatedList.push(sortedList[i * n])
    }

    return curatedList
  }
}
