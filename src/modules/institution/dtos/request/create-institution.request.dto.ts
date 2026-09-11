import { IsOptional, IsString, Length } from 'class-validator';

export class CreateInstitutionRequestDto {
  @IsString()
  @Length(1, 150)
  name: string;

  @IsOptional()
  @IsString()
  @Length(1, 30)
  abbreviation?: string;
}
