import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, Length } from 'class-validator';
import { LineType } from '@prisma/client';

export class CreateResearchLineRequestDto {
  @ApiProperty({
    description: 'Nombre de la línea de investigación',
    example: 'Inteligencia Artificial',
  })
  @IsString()
  @Length(1, 200)
  name: string;

  @ApiProperty({
    description: 'Tipo de línea de investigación',
    enum: LineType,
    example: LineType.HRL,
  })
  @IsEnum(LineType)
  type: LineType;
}