import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ResearchLineNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Research line with id ${id} not found`, DomainErrorCode.RESEARCH_LINE_NOT_FOUND);
  }
}
