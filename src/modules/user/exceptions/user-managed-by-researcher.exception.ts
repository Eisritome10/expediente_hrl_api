import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class UserManagedByResearcherException extends DomainException {
  constructor() {
    super(
      'El usuario pertenece a un investigador; gestiónelo desde el investigador',
      DomainErrorCode.USER_MANAGED_BY_RESEARCHER,
    );
  }
}
