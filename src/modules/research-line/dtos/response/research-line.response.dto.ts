import { ResearchLine } from '@prisma/client';

export class ResearchLineResponseDto {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly type: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

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
