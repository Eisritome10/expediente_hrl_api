import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolReviewObservationsRequiredException extends DomainException {
  constructor() {
    super(
      'An OBSERVED review requires at least one observation, and every observation needs a type and non-empty text',
      DomainErrorCode.PROTOCOL_REVIEW_OBSERVATIONS_REQUIRED,
    );
  }
}
