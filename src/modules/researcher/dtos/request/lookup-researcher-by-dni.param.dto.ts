import { Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LookupResearcherByDniParamDto {
  @ApiProperty({ description: 'DNI a consultar en RENIEC (8 dígitos)', example: '12345678' })
  @Matches(/^\d{8}$/, { message: 'dni must be exactly 8 digits' })
  dni: string;
}
