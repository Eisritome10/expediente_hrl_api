import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ResearcherAccountNotLinkedException extends DomainException {
  constructor() {
    super(
      'El usuario no está vinculado a un investigador',
      DomainErrorCode.RESEARCHER_ACCOUNT_NOT_LINKED,
    );
  }
}
