import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class UserEmailAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`Ya existe un usuario con el correo ${email}`, DomainErrorCode.USER_EMAIL_ALREADY_EXISTS);
  }
}
