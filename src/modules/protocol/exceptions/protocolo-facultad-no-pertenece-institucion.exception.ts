import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocoloFacultadNoPerteneceInstitucionException extends DomainException {
  constructor() {
    super(
      'facultadId must be a faculty of the university referenced by institucionId',
      DomainErrorCode.PROTOCOLO_FACULTAD_NO_PERTENECE_INSTITUCION,
    );
  }
}
