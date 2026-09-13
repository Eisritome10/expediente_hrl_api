import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ProtocolInvalidReferenceException extends DomainException {
  constructor(entity: string, id: string) {
    super(
      `Referenced ${entity} with id ${id} does not exist or is not valid for this field`,
      DomainErrorCode.PROTOCOL_INVALID_REFERENCE,
    );
  }
}
