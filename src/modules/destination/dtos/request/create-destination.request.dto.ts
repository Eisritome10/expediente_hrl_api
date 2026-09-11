import { IsString, Length } from 'class-validator';

export class CreateDestinationRequestDto {
  @IsString()
  @Length(1, 150)
  description: string;
}
