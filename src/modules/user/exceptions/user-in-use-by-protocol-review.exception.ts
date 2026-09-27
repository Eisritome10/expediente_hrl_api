import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class UserInUseByProtocolReviewException extends DomainException {
  constructor() {
    super(
      'User cannot be deleted because it is referenced by a protocol review',
      DomainErrorCode.USER_IN_USE_BY_PROTOCOL_REVIEW,
    );
  }
}
