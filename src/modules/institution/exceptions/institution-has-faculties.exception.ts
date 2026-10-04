import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class InstitutionHasFacultiesException extends DomainException {
  constructor(institutionId: string) {
    super(
      `Institution ${institutionId} still has faculties: delete them before changing its type`,
      DomainErrorCode.INSTITUTION_HAS_FACULTIES,
    );
  }
}
