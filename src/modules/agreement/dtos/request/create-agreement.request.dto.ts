import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpperCase } from '../../../../common/decorators/upper-case.decorator';

export class CreateAgreementRequestDto {
  @ApiProperty({ description: 'Nombre del convenio', example: 'Universidad Nacional de la Amazonía Peruana' })
  @IsString()
  @Length(1, 150)
  @UpperCase()
  name: string;
}
