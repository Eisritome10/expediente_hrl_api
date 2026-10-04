import { Institution, InstitutionType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class InstitutionResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly name: string;
  @ApiPropertyOptional({ nullable: true }) readonly abbreviation: string | null;
  @ApiProperty({ enum: InstitutionType }) readonly type: InstitutionType;
  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    abbreviation: string | null,
    type: InstitutionType,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.abbreviation = abbreviation;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(institution: Institution): InstitutionResponseDto {
    return new InstitutionResponseDto(
      institution.id,
      institution.name,
      institution.abbreviation,
      institution.type,
      institution.createdAt,
      institution.updatedAt,
    );
  }
}
