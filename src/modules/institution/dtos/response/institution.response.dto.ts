import { Institution } from '@prisma/client';

export class InstitutionResponseDto {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly abbreviation: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static from(institution: Institution): InstitutionResponseDto {
    return new InstitutionResponseDto(
      institution.id,
      institution.name,
      institution.abbreviation,
      institution.createdAt,
      institution.updatedAt,
    );
  }
}
