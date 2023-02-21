import { ConnectError } from '../ConnectError'

export enum ConnectErrorNames {
  EmailAlreadyUsed = 'EmailAlreadyUser',
  InvalidCredentials = 'InvalidCredentials',
  InvalidToken = 'InvalidToken',
}

export const connectErrorsMap: Map<ConnectErrorNames, ConnectError> = new Map<
  ConnectErrorNames,
  ConnectError
>([
  [
    ConnectErrorNames.EmailAlreadyUsed,
    new ConnectError(
      400,
      ConnectErrorNames.EmailAlreadyUsed,
      'INVALID_EMAIL',
      'This email is already used'
    ),
  ],
  [
    ConnectErrorNames.InvalidCredentials,
    new ConnectError(
      401,
      ConnectErrorNames.InvalidCredentials,
      'INVALID_CREDENTIALS',
      'The credentials are not valid'
    ),
  ],
  [
    ConnectErrorNames.InvalidToken,
    new ConnectError(
      401,
      ConnectErrorNames.InvalidToken,
      'INVALID_TOKEN',
      'The token sent is not valid'
    ),
  ],
])
