import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolNroExpedienteAlreadyExistsException extends DomainException {
  constructor(nroExpediente: string) {
    super(
      `Protocol with nroExpediente ${nroExpediente} already exists`,
      DomainErrorCode.PROTOCOL_NRO_EXPEDIENTE_ALREADY_EXISTS,
    );
  }
}
