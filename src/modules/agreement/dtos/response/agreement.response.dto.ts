import { Agreement } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class AgreementResponseDto {
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

  static from(agreement: Agreement): AgreementResponseDto {
    return new AgreementResponseDto(agreement.id, agreement.name, agreement.createdAt, agreement.updatedAt);
  }
}
