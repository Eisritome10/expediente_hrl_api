import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolReviewObservationsRequiredException extends DomainException {
  constructor() {
    super(
      'observations is required when the review status is OBSERVED',
      DomainErrorCode.PROTOCOL_REVIEW_OBSERVATIONS_REQUIRED,
    );
  }
}
