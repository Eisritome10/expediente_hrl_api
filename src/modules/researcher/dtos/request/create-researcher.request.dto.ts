import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

export class CreateResearcherRequestDto {
  @Matches(/^\d{8}$/, { message: 'dni must be exactly 8 digits' })
  dni: string;

  @IsString()
  @Length(1, 100)
  firstName: string;

  @IsString()
  @Length(1, 100)
  lastName: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
