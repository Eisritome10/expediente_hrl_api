import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolReviewProtocolAlreadyFinalizedException extends DomainException {
  constructor(protocolId: string) {
    super(
      `Protocol ${protocolId} is already FINALIZED and cannot be reviewed again`,
      DomainErrorCode.PROTOCOL_REVIEW_PROTOCOL_ALREADY_FINALIZED,
    );
  }
}
