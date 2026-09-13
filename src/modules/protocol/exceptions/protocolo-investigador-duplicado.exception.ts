import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocoloInvestigadorDuplicadoException extends DomainException {
  constructor() {
    super(
      'investigadorPrincipalId cannot also be listed as coinvestigador or asesor',
      DomainErrorCode.PROTOCOLO_INVESTIGADOR_DUPLICADO,
    );
  }
}
