import { IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UpperCase } from '../../../../common/decorators/upper-case.decorator';

export class CreateFacultyRequestDto {
  @ApiProperty({ description: 'Nombre de la facultad', example: 'Medicina' })
  @IsString()
  @Length(1, 150)
  @UpperCase()
  name: string;

  @ApiProperty({ description: 'Id de la universidad a la que pertenece la facultad' })
  @IsUUID()
  institutionId: string;
}
