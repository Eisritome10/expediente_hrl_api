import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class FacultyInstitutionNotUniversityException extends DomainException {
  constructor(institutionId: string) {
    super(
      `Institution ${institutionId} is not a university, so it cannot have faculties`,
      DomainErrorCode.FACULTY_INSTITUTION_NOT_UNIVERSITY,
    );
  }
}
