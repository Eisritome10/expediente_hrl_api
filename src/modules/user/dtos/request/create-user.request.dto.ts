import { IsEnum, IsIn, IsOptional, IsString, Length, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole, UserStatus } from '@prisma/client';

// RESEARCHER solo se asigna automáticamente al crear un investigador.
export const ASSIGNABLE_USER_ROLES = Object.values(UserRole).filter((role) => role !== UserRole.RESEARCHER);

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

  @ApiPropertyOptional({ description: 'Rol del usuario', enum: ASSIGNABLE_USER_ROLES })
  @IsOptional()
  @IsIn(ASSIGNABLE_USER_ROLES)
  role?: UserRole;

  @ApiPropertyOptional({ description: 'Estado del usuario', enum: UserStatus })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
