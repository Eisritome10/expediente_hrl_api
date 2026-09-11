import { Faculty } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class FacultyResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly name: string;
  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(id: string, name: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(faculty: Faculty): FacultyResponseDto {
    return new FacultyResponseDto(faculty.id, faculty.name, faculty.createdAt, faculty.updatedAt);
  }
}
