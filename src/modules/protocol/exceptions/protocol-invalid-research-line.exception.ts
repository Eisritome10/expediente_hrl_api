import { LineType } from '@prisma/client';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolInvalidResearchLineException extends DomainException {
  constructor(field: 'lineaHrlId' | 'lineaMeta2030Id', expectedType: LineType) {
    super(
      `${field} must reference a ResearchLine of type ${expectedType}`,
      DomainErrorCode.PROTOCOL_INVALID_RESEARCH_LINE,
    );
  }
}
