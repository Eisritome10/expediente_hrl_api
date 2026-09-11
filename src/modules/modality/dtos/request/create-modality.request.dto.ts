import { IsNumber, IsString, Length, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModalityRequestDto {
  @ApiProperty({ description: 'Nombre de la modalidad', example: 'Investigación con financiamiento' })
  @IsString()
  @Length(1, 150)
  name: string;

  @ApiProperty({ description: 'Costo de la modalidad', example: 150.5, minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fee: number;
}
