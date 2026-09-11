import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ResearcherEmailAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`Researcher with email ${email} already exists`, DomainErrorCode.RESEARCHER_EMAIL_ALREADY_EXISTS);
  }
}
