import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolReviewFinalizationIncompleteException extends DomainException {
  constructor() {
    super(
      'A CIEI FINALIZED review requires tieneConstanciaEtica, catalogadoRiesgo and consentimientoInformado to be set',
      DomainErrorCode.PROTOCOL_REVIEW_FINALIZATION_INCOMPLETE,
    );
  }
}
