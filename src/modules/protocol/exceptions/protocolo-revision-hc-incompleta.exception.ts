import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocoloRevisionHcIncompletaException extends DomainException {
  constructor() {
    super(
      'montoHc, tipoComprobanteHc and nroComprobanteHc are required when requiereRevisionHc is true',
      DomainErrorCode.PROTOCOLO_REVISION_HC_INCOMPLETA,
    );
  }
}
