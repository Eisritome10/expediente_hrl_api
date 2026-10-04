import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocoloComprobanteInvalidoException extends DomainException {
  constructor(detail: string) {
    super(
      `Invalid payment receipt: ${detail}. Expected a SUNAT receipt such as B001-00001234 (boleta) or F001-00001234 (factura)`,
      DomainErrorCode.PROTOCOLO_COMPROBANTE_INVALIDO,
    );
  }
}
