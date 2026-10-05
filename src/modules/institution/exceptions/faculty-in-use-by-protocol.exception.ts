import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class FacultyInUseByProtocolException extends DomainException {
  constructor(id: string) {
    super(
      `Faculty ${id} cannot be deleted because it is being used by a protocol`,
      DomainErrorCode.FACULTY_IN_USE_BY_PROTOCOL,
    );
  }
}
