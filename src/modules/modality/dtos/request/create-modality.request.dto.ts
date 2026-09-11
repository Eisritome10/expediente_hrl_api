import { IsNumber, IsString, Length, Min } from 'class-validator';

export class CreateModalityRequestDto {
  @IsString()
  @Length(1, 150)
  name: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fee: number;
}
