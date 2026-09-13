import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UpperCase } from '../../../../common/decorators/upper-case.decorator';

export class CreateResearcherRequestDto {
  @ApiProperty({ description: 'DNI del investigador (8 dígitos)', example: '12345678' })
  @Matches(/^\d{8}$/, { message: 'dni must be exactly 8 digits' })
  @UpperCase()
  dni: string;

  @ApiProperty({ description: 'Nombres del investigador', example: 'Juan' })
  @IsString()
  @Length(1, 100)
  @UpperCase()
  firstName: string;

  @ApiProperty({ description: 'Apellidos del investigador', example: 'Pérez' })
  @IsString()
  @Length(1, 100)
  @UpperCase()
  lastName: string;

  @ApiPropertyOptional({ description: 'Correo electrónico del investigador', example: 'juan.perez@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Teléfono del investigador', example: '987654321' })
  @IsOptional()
  @IsString()
  @UpperCase()
  phone?: string;
}
