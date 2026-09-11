import { Modality } from '@prisma/client';

export class ModalityResponseDto {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly fee: number,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

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
