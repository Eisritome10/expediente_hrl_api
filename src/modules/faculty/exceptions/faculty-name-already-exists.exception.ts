import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class FacultyNameAlreadyExistsException extends DomainException {
  constructor(name: string) {
    super(`Faculty with name ${name} already exists`, DomainErrorCode.FACULTY_NAME_ALREADY_EXISTS);
  }
}
