export interface IAliasError {
  code: number
  name: string
  reason: string
  message: string
  details: object | object[]
  status: string

  buildForApi(): {
    reason: string
    status: string
    details: object | object[]
  }

  buildForLogger(): string
}
