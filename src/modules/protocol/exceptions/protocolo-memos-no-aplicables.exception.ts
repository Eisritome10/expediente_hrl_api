import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocoloMemosNoAplicablesException extends DomainException {
  constructor() {
    super(
      'destinoIds must be empty when esInstitucional is false',
      DomainErrorCode.PROTOCOLO_MEMOS_NO_APLICABLES,
    );
  }
}
