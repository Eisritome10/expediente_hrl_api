import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolReviewInvalidOutcomeForCommitteeException extends DomainException {
  constructor(committee: string, outcome: string) {
    super(
      `Outcome ${outcome} is not valid for committee ${committee}`,
      DomainErrorCode.PROTOCOL_REVIEW_INVALID_OUTCOME_FOR_COMMITTEE,
    );
  }
}
