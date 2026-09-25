import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class UserUsernameAlreadyExistsException extends DomainException {
  constructor(username: string) {
    super(`User with username ${username} already exists`, DomainErrorCode.USER_USERNAME_ALREADY_EXISTS);
  }
}
