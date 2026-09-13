import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Protocol with id ${id} not found`, DomainErrorCode.PROTOCOL_NOT_FOUND);
  }
}
