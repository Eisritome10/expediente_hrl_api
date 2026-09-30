import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolReviewCicApprovalRequiredException extends DomainException {
  constructor(protocolId: string) {
    super(
      `Protocol ${protocolId} requires CIC approval before a CIEI review`,
      DomainErrorCode.PROTOCOL_REVIEW_CIC_APPROVAL_REQUIRED,
    );
  }
}
