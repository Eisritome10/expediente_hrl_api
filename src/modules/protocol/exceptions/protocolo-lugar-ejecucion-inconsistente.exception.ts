import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocoloLugarEjecucionInconsistenteException extends DomainException {
  constructor() {
    super(
      'lugarEjecucion cannot reference the Hospital Regional when esInstitucional is false',
      DomainErrorCode.PROTOCOLO_LUGAR_EJECUCION_INCONSISTENTE,
    );
  }
}
