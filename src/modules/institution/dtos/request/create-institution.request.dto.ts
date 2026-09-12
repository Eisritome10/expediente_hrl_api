import { IsOptional, IsString, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UpperCase } from '../../../../common/decorators/upper-case.decorator';

export class CreateInstitutionRequestDto {
  @ApiProperty({ description: 'Nombre de la institución', example: 'Hospital Rebagliati' })
  @IsString()
  @Length(1, 150)
  @UpperCase()
  name: string;

  @ApiPropertyOptional({ description: 'Abreviatura de la institución', example: 'HRL' })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  @UpperCase()
  abbreviation?: string;
}
