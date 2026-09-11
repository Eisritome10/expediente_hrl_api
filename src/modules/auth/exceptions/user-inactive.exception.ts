import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class UserInactiveException extends DomainException {
  constructor() {
    super('User is inactive', DomainErrorCode.USER_INACTIVE);
  }
}
