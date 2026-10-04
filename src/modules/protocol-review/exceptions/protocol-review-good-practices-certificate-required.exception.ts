import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolReviewGoodPracticesCertificateRequiredException extends DomainException {
  constructor() {
    super(
      'The protocol requires clinical-record review, so certificadoBuenasPracticas must be registered before CIEI can finalize',
      DomainErrorCode.PROTOCOL_REVIEW_GOOD_PRACTICES_CERTIFICATE_REQUIRED,
    );
  }
}
