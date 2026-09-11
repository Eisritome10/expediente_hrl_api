import { Destination } from '@prisma/client';

export class DestinationResponseDto {
  private constructor(
    readonly id: string,
    readonly description: string,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

  static from(destination: Destination): DestinationResponseDto {
    return new DestinationResponseDto(
      destination.id,
      destination.description,
      destination.createdAt,
      destination.updatedAt,
    );
  }
}
