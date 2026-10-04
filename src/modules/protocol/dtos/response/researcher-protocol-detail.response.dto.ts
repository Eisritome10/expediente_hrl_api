import { Committee, ProtocolStatus, ReviewOutcome } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResearcherProtocolDetail } from '../../protocol.include';
import { ProtocolCorrectionResponseDto, ProtocolRelatedResearcherResponseDto } from './protocol.response.dto';
import { ProtocolReviewObservationResponseDto } from '../../../protocol-review/dtos/response/protocol-review-observation.response.dto';

class ResearcherProtocolOriginalResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly nroExpediente: string;

  private constructor(id: string, nroExpediente: string) {
    this.id = id;
    this.nroExpediente = nroExpediente;
  }

  static of(id: string, nroExpediente: string): ResearcherProtocolOriginalResponseDto {
    return new ResearcherProtocolOriginalResponseDto(id, nroExpediente);
  }
}

class ResearcherProtocolReviewResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty({ enum: Committee }) readonly committee: Committee;
  @ApiProperty({ enum: ReviewOutcome }) readonly outcome: ReviewOutcome;
  @ApiProperty({ type: [ProtocolReviewObservationResponseDto] })
  readonly observations: ProtocolReviewObservationResponseDto[];
  @ApiProperty() readonly createdAt: Date;

  private constructor(
    id: string,
    committee: Committee,
    outcome: ReviewOutcome,
    observations: ProtocolReviewObservationResponseDto[],
    createdAt: Date,
  ) {
    this.id = id;
    this.committee = committee;
    this.outcome = outcome;
    this.observations = observations;
    this.createdAt = createdAt;
  }

  static of(
    id: string,
    committee: Committee,
    outcome: ReviewOutcome,
    observations: ProtocolReviewObservationResponseDto[],
    createdAt: Date,
  ): ResearcherProtocolReviewResponseDto {
    return new ResearcherProtocolReviewResponseDto(id, committee, outcome, observations, createdAt);
  }
}

export class ResearcherProtocolDetailResponseDto {
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

  @ApiProperty() readonly esEnmienda: boolean;
  @ApiPropertyOptional({ type: ResearcherProtocolOriginalResponseDto, nullable: true })
  readonly protocoloOriginal: ResearcherProtocolOriginalResponseDto | null;

  @ApiProperty({ type: ResearcherProtocolReviewResponseDto, isArray: true })
  readonly reviews: ResearcherProtocolReviewResponseDto[];

  @ApiProperty({ type: ProtocolCorrectionResponseDto, isArray: true })
  readonly corrections: ProtocolCorrectionResponseDto[];

  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(
    id: string,
    nroExpediente: string,
    titulo: string,
    fechaRecepcion: Date,
    status: ProtocolStatus,
    investigadorPrincipal: ProtocolRelatedResearcherResponseDto,
    esEnmienda: boolean,
    protocoloOriginal: ResearcherProtocolOriginalResponseDto | null,
    reviews: ResearcherProtocolReviewResponseDto[],
    corrections: ProtocolCorrectionResponseDto[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.nroExpediente = nroExpediente;
    this.titulo = titulo;
    this.fechaRecepcion = fechaRecepcion;
    this.status = status;
    this.investigadorPrincipal = investigadorPrincipal;
    this.esEnmienda = esEnmienda;
    this.protocoloOriginal = protocoloOriginal;
    this.reviews = reviews;
    this.corrections = corrections;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(protocol: ResearcherProtocolDetail): ResearcherProtocolDetailResponseDto {
    return new ResearcherProtocolDetailResponseDto(
      protocol.id,
      protocol.nroExpediente,
      protocol.titulo,
      protocol.fechaRecepcion,
      protocol.status,
      ProtocolRelatedResearcherResponseDto.from(protocol.investigadorPrincipal),
      protocol.esEnmienda,
      protocol.protocoloOriginal
        ? ResearcherProtocolOriginalResponseDto.of(
            protocol.protocoloOriginal.id,
            protocol.protocoloOriginal.nroExpediente,
          )
        : null,
      protocol.reviews.map((review) =>
        ResearcherProtocolReviewResponseDto.of(
          review.id,
          review.committee,
          review.outcome,
          ProtocolReviewObservationResponseDto.listFrom(review.observationItems, review.observations),
          review.createdAt,
        ),
      ),
      protocol.corrections.map((correction) =>
        ProtocolCorrectionResponseDto.of(correction.id, correction.comment, correction.createdAt),
      ),
      protocol.createdAt,
      protocol.updatedAt,
    );
  }
}
