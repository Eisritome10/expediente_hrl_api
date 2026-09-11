import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super('Invalid credentials', DomainErrorCode.INVALID_CREDENTIALS);
  }
}
