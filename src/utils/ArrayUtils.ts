export abstract class ArrayUtils {
  /**
   * Filter a collection by removing elements that have every property similar.
   * @param arr the collection to filter
   */
  static removeDuplicate<T extends Record<never, unknown>>(arr: T[]): T[] {
    return [...new Map(arr.map((v) => [JSON.stringify(v), v])).values()]
  }

  /**
   * Return a sample of the collection in parameter. To build the sample, first we sort the collection, then we're taking elements separated by the same intervalle.
   * Examples : getSample([1,2,3,4,5,6], 2) => [1,4], getSample([1,2,3,4,5,6], 3) => [1,3,5]
   * @param list the collection from which we'll get a sample
   * @param size the size of the sample
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
