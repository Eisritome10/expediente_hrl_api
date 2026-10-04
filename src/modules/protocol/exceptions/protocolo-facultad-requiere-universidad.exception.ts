import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocoloFacultadRequiereUniversidadException extends DomainException {
  constructor() {
    super(
      'facultadId requires institucionId to reference an institution of type UNIVERSITY',
      DomainErrorCode.PROTOCOLO_FACULTAD_REQUIERE_UNIVERSIDAD,
    );
  }
}
