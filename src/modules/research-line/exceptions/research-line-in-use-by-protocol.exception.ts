import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ResearchLineInUseByProtocolException extends DomainException {
  constructor() {
    super(
      'Research line cannot be deleted because it is being used by a protocol',
      DomainErrorCode.RESEARCH_LINE_IN_USE_BY_PROTOCOL,
    );
  }
}