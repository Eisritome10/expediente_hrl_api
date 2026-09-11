import { Modality } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class ModalityResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly name: string;
  @ApiProperty() readonly fee: number;
  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(id: string, name: string, fee: number, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.name = name;
    this.fee = fee;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(modality: Modality): ModalityResponseDto {
    return new ModalityResponseDto(
      modality.id,
      modality.name,
      Number(modality.fee),
      modality.createdAt,
      modality.updatedAt,
    );
  }
}
