import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class StudyDesignNotFoundException extends DomainException {
  constructor(id: string) {
    super(`StudyDesign with id ${id} not found`, DomainErrorCode.STUDY_DESIGN_NOT_FOUND);
  }
}
