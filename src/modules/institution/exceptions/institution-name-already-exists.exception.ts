import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class InstitutionNameAlreadyExistsException extends DomainException {
  constructor(name: string) {
    super(`Institution with name ${name} already exists`, DomainErrorCode.INSTITUTION_NAME_ALREADY_EXISTS);
  }
}
