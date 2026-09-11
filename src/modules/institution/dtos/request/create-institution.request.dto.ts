import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateInstitutionRequestDto {
  @ApiProperty({ description: 'Nombre de la institución', example: 'Hospital Rebagliati' })
  @IsString()
  @Length(1, 150)
  name: string;

  @ApiPropertyOptional({ description: 'Abreviatura de la institución', example: 'HRL' })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  abbreviation?: string;
}
