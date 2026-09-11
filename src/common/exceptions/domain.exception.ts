import { DomainErrorCode } from '../enums/domain-error-code.enum';

export class DomainException extends Error {
  constructor(
    readonly message: string,
    public errorCode: DomainErrorCode,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}
