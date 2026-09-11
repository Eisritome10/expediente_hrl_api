import { Injectable } from '@nestjs/common';
import { Faculty } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { FacultyNotFoundException } from '../exceptions/faculty-not-found.exception';

@Injectable()
export class FindFacultyByIdFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string): Promise<Faculty> {
    const faculty = await this.prisma.faculty.findUnique({ where: { id } });

    if (!faculty) {
      throw new FacultyNotFoundException(id);
    }

    return faculty;
  }
}
