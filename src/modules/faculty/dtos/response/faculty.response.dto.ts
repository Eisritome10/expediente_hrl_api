import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Faculty } from '@prisma/client';

type FacultySource = Faculty & { institution?: { id: string; name: string } | null };

export class FacultyResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly name: string;
  @ApiPropertyOptional({ nullable: true, description: 'Universidad a la que pertenece (nulo en facultades históricas)' })
  readonly institutionId: string | null;
  @ApiPropertyOptional({ nullable: true }) readonly institutionName: string | null;
  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(
    id: string,
    name: string,
    institutionId: string | null,
    institutionName: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.name = name;
    this.institutionId = institutionId;
    this.institutionName = institutionName;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(faculty: FacultySource): FacultyResponseDto {
    return new FacultyResponseDto(
      faculty.id,
      faculty.name,
      faculty.institutionId,
      faculty.institution?.name ?? null,
      faculty.createdAt,
      faculty.updatedAt,
    );
  }
}
