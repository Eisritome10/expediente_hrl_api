import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiProperty({ description: 'Nombre de usuario (DNI para investigadores) o correo electrónico', example: 'jperez' })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ description: 'Contraseña del usuario' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
