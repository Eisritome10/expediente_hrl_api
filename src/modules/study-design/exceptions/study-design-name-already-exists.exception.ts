import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class StudyDesignNameAlreadyExistsException extends DomainException {
  constructor(name: string) {
    super(`StudyDesign with name ${name} already exists`, DomainErrorCode.STUDY_DESIGN_NAME_ALREADY_EXISTS);
  }
}
