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
    [DomainErrorCode.FACULTY_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [DomainErrorCode.FACULTY_NAME_ALREADY_EXISTS]: HttpStatus.CONFLICT,
    [DomainErrorCode.DESTINATION_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [DomainErrorCode.DESTINATION_DESCRIPTION_ALREADY_EXISTS]: HttpStatus.CONFLICT,
    [DomainErrorCode.INVALID_CREDENTIALS]: HttpStatus.UNAUTHORIZED,
    [DomainErrorCode.USER_INACTIVE]: HttpStatus.FORBIDDEN,

    [DomainErrorCode.RESEARCH_LINE_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [DomainErrorCode.RESEARCH_LINE_NAME_AND_TYPE_ALREADY_EXISTS]: HttpStatus.CONFLICT,

    [DomainErrorCode.MODALITY_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [DomainErrorCode.MODALITY_NAME_ALREADY_EXISTS]: HttpStatus.CONFLICT,
    [DomainErrorCode.STUDY_DESIGN_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [DomainErrorCode.STUDY_DESIGN_NAME_ALREADY_EXISTS]: HttpStatus.CONFLICT,
    [DomainErrorCode.PROTOCOL_NOT_FOUND]: HttpStatus.NOT_FOUND,
    [DomainErrorCode.PROTOCOL_NRO_EXPEDIENTE_ALREADY_EXISTS]: HttpStatus.CONFLICT,
    [DomainErrorCode.PROTOCOL_INVALID_REFERENCE]: HttpStatus.BAD_REQUEST,
    [DomainErrorCode.PROTOCOL_INVALID_RESEARCH_LINE]: HttpStatus.BAD_REQUEST,
    [DomainErrorCode.PROTOCOLO_CONVENIO_SIN_NOMBRE]: HttpStatus.BAD_REQUEST,
    [DomainErrorCode.PROTOCOLO_REVISION_HC_INCOMPLETA]: HttpStatus.BAD_REQUEST,
    [DomainErrorCode.PROTOCOLO_INVESTIGADOR_DUPLICADO]: HttpStatus.BAD_REQUEST,
    [DomainErrorCode.PROTOCOLO_LUGAR_EJECUCION_INCONSISTENTE]: HttpStatus.BAD_REQUEST,
    [DomainErrorCode.PROTOCOLO_MEMOS_NO_APLICABLES]: HttpStatus.BAD_REQUEST,
    [DomainErrorCode.PROTOCOLO_FACULTAD_REQUIERE_UNIVERSIDAD]: HttpStatus.BAD_REQUEST,
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