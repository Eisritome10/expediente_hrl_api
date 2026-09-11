import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFacultyRequestDto {
  @ApiProperty({ description: 'Nombre de la facultad', example: 'Medicina' })
  @IsString()
  @Length(1, 150)
  name: string;
}
