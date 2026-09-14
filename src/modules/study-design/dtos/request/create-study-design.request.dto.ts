import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpperCase } from '../../../../common/decorators/upper-case.decorator';

export class CreateStudyDesignRequestDto {
  @ApiProperty({ description: 'Nombre del diseño de estudio', example: 'Descriptivo transversal' })
  @IsString()
  @Length(1, 150)
  @UpperCase()
  name: string;
}
