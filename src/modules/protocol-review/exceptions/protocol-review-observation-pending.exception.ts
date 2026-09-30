import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolReviewObservationPendingException extends DomainException {
  constructor(protocolId: string) {
    super(
      `Protocol ${protocolId} has a pending CIEI observation that must be corrected before finalizing`,
      DomainErrorCode.PROTOCOL_REVIEW_OBSERVATION_PENDING,
    );
  }
}
