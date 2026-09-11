import { Researcher } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ResearcherResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly dni: string;
  @ApiProperty() readonly firstName: string;
  @ApiProperty() readonly lastName: string;
  @ApiPropertyOptional({ nullable: true }) readonly email: string | null;
  @ApiPropertyOptional({ nullable: true }) readonly phone: string | null;
  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(
    id: string,
    dni: string,
    firstName: string,
    lastName: string,
    email: string | null,
    phone: string | null,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.dni = dni;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.phone = phone;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(researcher: Researcher): ResearcherResponseDto {
    return new ResearcherResponseDto(
      researcher.id,
      researcher.dni,
      researcher.firstName,
      researcher.lastName,
      researcher.email,
      researcher.phone,
      researcher.createdAt,
      researcher.updatedAt,
    );
  }
}
