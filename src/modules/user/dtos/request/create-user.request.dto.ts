import { IsEnum, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

export class CreateUserRequestDto {
  @ApiProperty({ description: 'Nombre de usuario', example: 'jperez' })
  @IsString()
  @Length(3, 50)
  username: string;

  @ApiProperty({ description: 'Nombre completo del usuario', example: 'Juan Pérez' })
  @IsString()
  @Length(1, 150)
  fullName: string;

  @ApiProperty({ description: 'Contraseña del usuario', example: 'ContraseñaSegura123' })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiPropertyOptional({ description: 'Rol del usuario', enum: UserRole })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Estado del usuario', enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
