import { LineType, ResearchLine } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ResearchLineResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly name: string;
  @ApiProperty({ enum: LineType }) readonly type: string;
  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(id: string, name: string, type: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(researchLine: ResearchLine): ResearchLineResponseDto {
    return new ResearchLineResponseDto(
      researchLine.id,
      researchLine.name,
      researchLine.type,
      researchLine.createdAt,
      researchLine.updatedAt,
    );
  }
}
