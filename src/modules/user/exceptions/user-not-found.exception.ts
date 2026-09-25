import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class UserNotFoundException extends DomainException {
  constructor(id: string) {
    super(`User with id ${id} not found`, DomainErrorCode.USER_NOT_FOUND);
  }
}
