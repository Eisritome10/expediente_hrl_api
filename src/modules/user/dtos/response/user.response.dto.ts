import { User, UserRole, UserStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly username: string;
  @ApiProperty() readonly fullName: string;
  @ApiProperty({ enum: UserRole }) readonly role: UserRole;
  @ApiProperty({ enum: UserStatus }) readonly status: UserStatus;
  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(
    id: string,
    username: string,
    fullName: string,
    role: UserRole,
    status: UserStatus,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.username = username;
    this.fullName = fullName;
    this.role = role;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(user: User): UserResponseDto {
    return new UserResponseDto(
      user.id,
      user.username,
      user.fullName,
      user.role,
      user.status,
      user.createdAt,
      user.updatedAt,
    );
  }
}
