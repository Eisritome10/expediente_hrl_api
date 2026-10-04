import { ApiProperty } from '@nestjs/swagger';
import { Committee, ReviewOutcome } from '@prisma/client';
import { ProtocolReviewWithRelations } from '../../protocol-review.include';
import { ProtocolReviewObservationResponseDto } from './protocol-review-observation.response.dto';

export class ProtocolReviewReviewerResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly username: string;
  @ApiProperty() readonly fullName: string;

  private constructor(id: string, username: string, fullName: string) {
    this.id = id;
    this.username = username;
    this.fullName = fullName;
  }

  static of(id: string, username: string, fullName: string): ProtocolReviewReviewerResponseDto {
    return new ProtocolReviewReviewerResponseDto(id, username, fullName);
  }
}

export class ProtocolReviewResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly protocolId: string;
  @ApiProperty({ enum: Committee }) readonly committee: Committee;
  @ApiProperty({ enum: ReviewOutcome }) readonly outcome: ReviewOutcome;
  @ApiProperty({ type: [ProtocolReviewObservationResponseDto] })
  readonly observations: ProtocolReviewObservationResponseDto[];
  @ApiProperty({ type: ProtocolReviewReviewerResponseDto }) readonly reviewer: ProtocolReviewReviewerResponseDto;
  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(
    id: string,
    protocolId: string,
    committee: Committee,
    outcome: ReviewOutcome,
    observations: ProtocolReviewObservationResponseDto[],
    reviewer: ProtocolReviewReviewerResponseDto,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.protocolId = protocolId;
    this.committee = committee;
    this.outcome = outcome;
    this.observations = observations;
    this.reviewer = reviewer;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(review: ProtocolReviewWithRelations): ProtocolReviewResponseDto {
    return new ProtocolReviewResponseDto(
      review.id,
      review.protocolId,
      review.committee,
      review.outcome,
      ProtocolReviewObservationResponseDto.listFrom(review.observationItems, review.observations),
      ProtocolReviewReviewerResponseDto.of(review.reviewer.id, review.reviewer.username, review.reviewer.fullName),
      review.createdAt,
      review.updatedAt,
    );
  }
}
