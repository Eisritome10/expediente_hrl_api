import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class InstitutionNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Institution with id ${id} not found`, DomainErrorCode.INSTITUTION_NOT_FOUND);
  }
}
