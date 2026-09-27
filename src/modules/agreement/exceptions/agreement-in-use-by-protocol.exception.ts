import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class AgreementInUseByProtocolException extends DomainException {
  constructor() {
    super(
      'Agreement cannot be deleted because it is being used by a protocol',
      DomainErrorCode.AGREEMENT_IN_USE_BY_PROTOCOL,
    );
  }
}
