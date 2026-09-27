import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProtocolStatus } from '@prisma/client';
import { ProtocolReviewWithRelations } from '../../protocol-review.include';

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
  @ApiProperty({ enum: ProtocolStatus }) readonly status: ProtocolStatus;
  @ApiPropertyOptional({ nullable: true }) readonly observations: string | null;
  @ApiProperty({ type: ProtocolReviewReviewerResponseDto }) readonly reviewer: ProtocolReviewReviewerResponseDto;
  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(
    id: string,
    protocolId: string,
    status: ProtocolStatus,
    observations: string | null,
    reviewer: ProtocolReviewReviewerResponseDto,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.protocolId = protocolId;
    this.status = status;
    this.observations = observations;
    this.reviewer = reviewer;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(review: ProtocolReviewWithRelations): ProtocolReviewResponseDto {
    return new ProtocolReviewResponseDto(
      review.id,
      review.protocolId,
      review.status,
      review.observations,
      ProtocolReviewReviewerResponseDto.of(review.reviewer.id, review.reviewer.username, review.reviewer.fullName),
      review.createdAt,
      review.updatedAt,
    );
  }
}
