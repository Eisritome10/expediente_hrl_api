import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDestinationRequestDto {
  @ApiProperty({ description: 'Descripción del destino', example: 'Comité de Ética' })
  @IsString()
  @Length(1, 150)
  description: string;
}
