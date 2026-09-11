import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ResearcherDniAlreadyExistsException extends DomainException {
  constructor(dni: string) {
    super(`Researcher with dni ${dni} already exists`, DomainErrorCode.RESEARCHER_DNI_ALREADY_EXISTS);
  }
}
