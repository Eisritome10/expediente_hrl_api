import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ReniecUnavailableException extends DomainException {
  constructor() {
    super('No fue posible consultar RENIEC en este momento', DomainErrorCode.RENIEC_UNAVAILABLE);
  }
}
