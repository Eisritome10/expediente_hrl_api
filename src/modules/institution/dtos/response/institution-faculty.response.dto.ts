import { ApiProperty } from '@nestjs/swagger';
import { Faculty } from '@prisma/client';

export class InstitutionFacultyResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly name: string;
  @ApiProperty({ description: 'Universidad a la que pertenece la facultad' }) readonly institutionId: string;
  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(id: string, name: string, institutionId: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.name = name;
    this.institutionId = institutionId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(faculty: Faculty): InstitutionFacultyResponseDto {
    return new InstitutionFacultyResponseDto(
      faculty.id,
      faculty.name,
      faculty.institutionId as string,
      faculty.createdAt,
      faculty.updatedAt,
    );
  }
}
