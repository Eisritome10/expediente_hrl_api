import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolReviewCommitteeClosedException extends DomainException {
  constructor(protocolId: string) {
    super(
      `CIC committee is closed for protocol ${protocolId}`,
      DomainErrorCode.PROTOCOL_REVIEW_COMMITTEE_CLOSED,
    );
  }
}
