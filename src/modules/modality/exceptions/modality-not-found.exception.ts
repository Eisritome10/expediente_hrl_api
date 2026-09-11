import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ModalityNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Modality with id ${id} not found`, DomainErrorCode.MODALITY_NOT_FOUND);
  }
}
