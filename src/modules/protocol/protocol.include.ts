import { Prisma } from '@prisma/client';

export const PROTOCOL_INCLUDE = {
  investigadorPrincipal: true,
  institucion: true,
  facultad: true,
  convenio: true,
  lineaHrl: true,
  lineaMeta2030: true,
  modalidad: true,
  coinvestigadores: { include: { researcher: true } },
  asesores: { include: { researcher: true } },
  destinos: { include: { destination: true } },
  disenosEstudio: { include: { studyDesign: true } },
} satisfies Prisma.ProtocolInclude;

export type ProtocolWithRelations = Prisma.ProtocolGetPayload<{ include: typeof PROTOCOL_INCLUDE }>;
