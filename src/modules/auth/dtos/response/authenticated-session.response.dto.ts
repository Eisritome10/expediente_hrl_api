import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class AuthCurrentUserResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly username: string;
  @ApiProperty({ enum: UserRole }) readonly role: UserRole;
}

export class AuthenticatedSessionResponseDto {
  @ApiProperty({ description: 'Token de acceso JWT' })
  readonly accessToken: string;

  @ApiProperty({ description: 'Token de refresco JWT' })
  readonly refreshToken: string;

  @ApiProperty({ type: AuthCurrentUserResponseDto })
  readonly user: AuthCurrentUserResponseDto;
}
