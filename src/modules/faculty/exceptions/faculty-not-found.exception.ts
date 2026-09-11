import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class FacultyNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Faculty with id ${id} not found`, DomainErrorCode.FACULTY_NOT_FOUND);
  }
}
