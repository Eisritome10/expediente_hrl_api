import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocoloConstanciaEticaIncompletaException extends DomainException {
  constructor() {
    super(
      'idConstanciaEtica and fechaConstancia are required when tieneConstanciaEtica is true',
      DomainErrorCode.PROTOCOLO_CONSTANCIA_ETICA_INCOMPLETA,
    );
  }
}
