import { DomainException } from '../../../common/exceptions/domain.exception';
import { DomainErrorCode } from '../../../common/enums/domain-error-code.enum';

export class ModalityNameAlreadyExistsException extends DomainException {
  constructor(name: string) {
    super(`Modality with name ${name} already exists`, DomainErrorCode.MODALITY_NAME_ALREADY_EXISTS);
  }
}
