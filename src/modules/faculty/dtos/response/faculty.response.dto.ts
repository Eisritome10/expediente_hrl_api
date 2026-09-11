import { Faculty } from '@prisma/client';

export class FacultyResponseDto {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static from(faculty: Faculty): FacultyResponseDto {
    return new FacultyResponseDto(faculty.id, faculty.name, faculty.createdAt, faculty.updatedAt);
  }
}
