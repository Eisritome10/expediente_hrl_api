import { Injectable } from '@nestjs/common';
import { Faculty, Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { getUniqueConstraintTarget } from '../../../common/utils/prisma-error.util';
import { FacultyNameAlreadyExistsException } from '../exceptions/faculty-name-already-exists.exception';

export type CreateFacultyInput = {
  name: string;
};

@Injectable()
export class CreateFacultyFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: CreateFacultyInput): Promise<Faculty> {
    try {
      return await this.prisma.faculty.create({ data: input });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const target = getUniqueConstraintTarget(e);
        if (target.includes('name')) throw new FacultyNameAlreadyExistsException(input.name);
      }
      throw e;
    }
  }
}
