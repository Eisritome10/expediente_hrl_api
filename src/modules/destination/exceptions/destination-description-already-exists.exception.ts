import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class DestinationDescriptionAlreadyExistsException extends DomainException {
  constructor(description: string) {
    super(
      `Destination with description ${description} already exists`,
      DomainErrorCode.DESTINATION_DESCRIPTION_ALREADY_EXISTS,
    );
  }
}
