import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocoloConvenioSinNombreException extends DomainException {
  constructor() {
    super(
      'nombreConvenio is required when esConvenio is true',
      DomainErrorCode.PROTOCOLO_CONVENIO_SIN_NOMBRE,
    );
  }
}
