import { Prisma } from '@prisma/client';

export const FACULTY_INCLUDE = {
  institution: { select: { id: true, name: true } },
} satisfies Prisma.FacultyInclude;

export type FacultyWithInstitution = Prisma.FacultyGetPayload<{ include: typeof FACULTY_INCLUDE }>;
