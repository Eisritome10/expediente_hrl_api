import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ReniecNotConfiguredException extends DomainException {
  constructor() {
    super('La consulta a RENIEC no está configurada (falta RENIEC_TOKEN)', DomainErrorCode.RENIEC_NOT_CONFIGURED);
  }
}
