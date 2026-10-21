import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ReniecDniNotFoundException extends DomainException {
  constructor(dni: string) {
    super(`No se encontró información en RENIEC para el DNI ${dni}`, DomainErrorCode.RENIEC_DNI_NOT_FOUND);
  }
}
