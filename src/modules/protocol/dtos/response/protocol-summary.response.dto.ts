import { Protocol, ProtocolStatus, Researcher } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { ProtocolRelatedResearcherResponseDto } from './protocol.response.dto';

export type ProtocolSummarySource = Protocol & { investigadorPrincipal: Researcher };

export class ProtocolSummaryResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly nroExpediente: string;
  @ApiProperty() readonly titulo: string;
  @ApiProperty() readonly fechaRecepcion: Date;
  @ApiProperty({
    enum: ProtocolStatus,
    description:
      'Estado del protocolo: CREATED (creado), CIC_OBSERVED (observado por CIC), CIC_CORRECTED (corregido para CIC), CIEI_OBSERVED (observado por CIEI), CIEI_CORRECTED (corregido para CIEI), FINALIZED (finalizado)',
  })
  readonly status: ProtocolStatus;

  @ApiProperty({ type: ProtocolRelatedResearcherResponseDto })
  readonly investigadorPrincipal: ProtocolRelatedResearcherResponseDto;

  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(
    id: string,
    nroExpediente: string,
    titulo: string,
    fechaRecepcion: Date,
    status: ProtocolStatus,
    investigadorPrincipal: ProtocolRelatedResearcherResponseDto,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.nroExpediente = nroExpediente;
    this.titulo = titulo;
    this.fechaRecepcion = fechaRecepcion;
    this.status = status;
    this.investigadorPrincipal = investigadorPrincipal;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(protocol: ProtocolSummarySource): ProtocolSummaryResponseDto {
    return new ProtocolSummaryResponseDto(
      protocol.id,
      protocol.nroExpediente,
      protocol.titulo,
      protocol.fechaRecepcion,
      protocol.status,
      ProtocolRelatedResearcherResponseDto.from(protocol.investigadorPrincipal),
      protocol.createdAt,
      protocol.updatedAt,
    );
  }
}
