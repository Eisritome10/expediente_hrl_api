import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ResearchLineNameAndTypeAlreadyExistsException extends DomainException {
  constructor(name: string, type: string) {
    super(
      `Research line with name ${name} and type ${type} already exists`,
      DomainErrorCode.RESEARCH_LINE_NAME_AND_TYPE_ALREADY_EXISTS,
    );
  }
}