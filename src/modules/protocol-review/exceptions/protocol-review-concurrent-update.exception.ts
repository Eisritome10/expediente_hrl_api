import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolReviewConcurrentUpdateException extends DomainException {
  constructor(protocolId: string) {
    super(
      `Protocol ${protocolId} changed state concurrently; retry the review`,
      DomainErrorCode.PROTOCOL_REVIEW_CONCURRENT_UPDATE,
    );
  }
}
