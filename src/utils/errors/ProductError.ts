import { AliasError } from './AliasError'
import ProductErrorUtils, { ProductErrorNames } from './types/ProductErrorUtils'

export class ProductError extends AliasError {
  constructor(name: ProductErrorNames, details: object | object[] = {}) {
    const { code, reason, status } = ProductErrorUtils.getErrorInfosByName(name)
    super(code, name, status, reason, details)
    this.reason = reason
    this.status = status
  }
}
