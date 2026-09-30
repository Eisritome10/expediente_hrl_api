import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolNotObservedException extends DomainException {
  constructor(id: string) {
    super(
      `Protocol ${id} can only be corrected while its status is CIC_OBSERVED or CIEI_OBSERVED`,
      DomainErrorCode.PROTOCOL_NOT_OBSERVED,
    );
  }
}
