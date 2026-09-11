import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ResearcherNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Researcher with id ${id} not found`, DomainErrorCode.RESEARCHER_NOT_FOUND);
  }
}
