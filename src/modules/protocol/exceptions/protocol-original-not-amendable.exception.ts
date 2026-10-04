import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolOriginalNotAmendableException extends DomainException {
  constructor(id: string) {
    super(
      `Original protocol with id ${id} must be FINALIZED to be amended`,
      DomainErrorCode.PROTOCOL_ORIGINAL_NOT_AMENDABLE,
    );
  }
}
