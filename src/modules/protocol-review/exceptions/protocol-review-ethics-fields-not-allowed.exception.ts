import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolReviewEthicsFieldsNotAllowedException extends DomainException {
  constructor() {
    super(
      'Ethics fields are only allowed on a CIEI review',
      DomainErrorCode.PROTOCOL_REVIEW_ETHICS_FIELDS_NOT_ALLOWED,
    );
  }
}
