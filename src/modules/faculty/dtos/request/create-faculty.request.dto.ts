import { IsString, Length } from 'class-validator';

export class CreateFacultyRequestDto {
  @IsString()
  @Length(1, 150)
  name: string;
}
