import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class AgreementNameAlreadyExistsException extends DomainException {
  constructor(name: string) {
    super(`Agreement with name ${name} already exists`, DomainErrorCode.AGREEMENT_NAME_ALREADY_EXISTS);
  }
}
