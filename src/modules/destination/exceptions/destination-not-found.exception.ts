import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class DestinationNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Destination with id ${id} not found`, DomainErrorCode.DESTINATION_NOT_FOUND);
  }
}
