import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolReviewConstanciaIncompleteException extends DomainException {
  constructor() {
    super(
      'idConstanciaEtica and fechaConstancia are required when tieneConstanciaEtica is true',
      DomainErrorCode.PROTOCOL_REVIEW_CONSTANCIA_INCOMPLETE,
    );
  }
}
