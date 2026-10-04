import { ApiProperty } from '@nestjs/swagger';
import { ObservationType } from '@prisma/client';

export class ProtocolReviewObservationResponseDto {
  @ApiProperty({
    enum: ObservationType,
    nullable: true,
    description: 'Tipo de observación; null en dictámenes anteriores a la clasificación por tipo',
  })
  readonly type: ObservationType | null;

  @ApiProperty() readonly text: string;

  private constructor(type: ObservationType | null, text: string) {
    this.type = type;
    this.text = text;
  }

  // Los dictámenes viejos solo guardaron un texto libre: se exponen como una única observación sin tipo.
  static listFrom(
    items: { type: ObservationType; text: string }[],
    legacyObservations: string | null,
  ): ProtocolReviewObservationResponseDto[] {
    if (items.length > 0) {
      return items.map((item) => new ProtocolReviewObservationResponseDto(item.type, item.text));
    }
    if (legacyObservations) {
      return [new ProtocolReviewObservationResponseDto(null, legacyObservations)];
    }
    return [];
  }
}
