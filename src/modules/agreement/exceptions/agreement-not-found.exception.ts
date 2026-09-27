import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class AgreementNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Agreement with id ${id} not found`, DomainErrorCode.AGREEMENT_NOT_FOUND);
  }
}
