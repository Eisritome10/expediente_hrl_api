import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainErrorCode } from '../enums/domain-error-code.enum';
import { DomainException } from '../exceptions/domain.exception';

@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly codeToStatus: Record<DomainErrorCode, HttpStatus> = {
    [DomainErrorCode.RESEARCHER_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [DomainErrorCode.RESEARCHER_DNI_ALREADY_EXISTS]: HttpStatus.CONFLICT,
    [DomainErrorCode.RESEARCHER_EMAIL_ALREADY_EXISTS]: HttpStatus.CONFLICT,
    [DomainErrorCode.INSTITUTION_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [DomainErrorCode.INSTITUTION_NAME_ALREADY_EXISTS]: HttpStatus.CONFLICT,
  };

  catch(exception: DomainException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = this.codeToStatus[exception.errorCode] ?? HttpStatus.BAD_REQUEST;

    response.status(status).json({
      statusCode: status,
      errorCode: exception.errorCode,
      message: exception.message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
