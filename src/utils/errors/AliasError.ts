import { IAliasError } from './IAliasError'

export class AliasError implements IAliasError {
  code
  name
  status
  reason
  details
  message = ''
  additionalInformation = {}

  constructor(
    code: number,
    name: string,
    status: string,
    reason: string,
    details: object | object[] = {}
  ) {
    this.code = code
    this.name = name
    this.status = status
    this.reason = reason
    this.details = details
  }

  buildForApi() {
    return {
      code: this.code,
      reason: this.reason,
      status: this.status,
      details: this.details,
    }
  }

  buildForLogger() {
    return JSON.stringify({
      code: this.code,
      name: this.name,
      reason: this.reason,
      status: this.status,
      details: this.details,
      additionalInformation: this.additionalInformation,
    })
  }
}
