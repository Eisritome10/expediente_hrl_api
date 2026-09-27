import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolReviewInvalidReviewerException extends DomainException {
  constructor(reviewerId: string) {
    super(
      `Reviewer ${reviewerId} does not exist or is not active`,
      DomainErrorCode.PROTOCOL_REVIEW_INVALID_REVIEWER,
    );
  }
}
