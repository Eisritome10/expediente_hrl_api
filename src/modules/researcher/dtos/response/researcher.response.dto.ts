import { Researcher } from '@prisma/client';

export class ResearcherResponseDto {
  private constructor(
    readonly id: string,
    readonly dni: string,
    readonly firstName: string,
    readonly lastName: string,
    readonly email: string | null,
    readonly phone: string | null,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static from(researcher: Researcher): ResearcherResponseDto {
    return new ResearcherResponseDto(
      researcher.id,
      researcher.dni,
      researcher.firstName,
      researcher.lastName,
      researcher.email,
      researcher.phone,
      researcher.createdAt,
      researcher.updatedAt,
    );
  }
}
