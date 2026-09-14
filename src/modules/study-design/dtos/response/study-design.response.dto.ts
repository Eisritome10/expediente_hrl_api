import { StudyDesign } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class StudyDesignResponseDto {
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

  static from(studyDesign: StudyDesign): StudyDesignResponseDto {
    return new StudyDesignResponseDto(studyDesign.id, studyDesign.name, studyDesign.createdAt, studyDesign.updatedAt);
  }
}
