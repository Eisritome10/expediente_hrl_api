import { ApiProperty } from '@nestjs/swagger';

export interface ReniecPerson {
  dni: string;
  firstName: string;
  lastName: string;
}

export class ReniecPersonResponseDto {
  @ApiProperty() readonly dni: string;
  @ApiProperty({ description: 'Nombres según RENIEC' }) readonly firstName: string;
  @ApiProperty({ description: 'Apellido paterno y materno según RENIEC' }) readonly lastName: string;

  private constructor(dni: string, firstName: string, lastName: string) {
    this.dni = dni;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  static from(person: ReniecPerson): ReniecPersonResponseDto {
    return new ReniecPersonResponseDto(person.dni, person.firstName, person.lastName);
  }
}
