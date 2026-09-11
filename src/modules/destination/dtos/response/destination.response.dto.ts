import { Destination } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class DestinationResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly description: string;
  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(id: string, description: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(destination: Destination): DestinationResponseDto {
    return new DestinationResponseDto(
      destination.id,
      destination.description,
      destination.createdAt,
      destination.updatedAt,
    );
  }
}
