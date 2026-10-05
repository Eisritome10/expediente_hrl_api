import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { FacultyNotFoundException } from '../exceptions/faculty-not-found.exception';
import { FacultyInUseByProtocolException } from '../exceptions/faculty-in-use-by-protocol.exception';

@Injectable()
export class DeleteInstitutionFacultyFeature {
  constructor(private readonly prisma: PrismaService) {}

  async execute(institutionId: string, facultyId: string): Promise<void> {
    const faculty = await this.prisma.faculty.findFirst({ where: { id: facultyId, institutionId } });
    if (!faculty) throw new FacultyNotFoundException(facultyId);

    // La relación Protocol -> Faculty es opcional (SetNull): sin esta comprobación el protocolo perdería su facultad.
    const protocols = await this.prisma.protocol.count({ where: { facultadId: facultyId } });
    if (protocols > 0) throw new FacultyInUseByProtocolException(facultyId);

    await this.prisma.faculty.delete({ where: { id: facultyId } });
  }
}
