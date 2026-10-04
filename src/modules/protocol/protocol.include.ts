import { Prisma } from '@prisma/client';

export const PROTOCOL_INCLUDE = {
  investigadorPrincipal: true,
  institucion: true,
  facultad: true,
  convenio: true,
  protocoloOriginal: { select: { id: true, nroExpediente: true } },
  lineaHrl: true,
  lineaMeta2030: true,
  modalidad: true,
  coinvestigadores: { include: { researcher: true } },
  asesores: { include: { researcher: true } },
  destinos: { include: { destination: true } },
  disenosEstudio: { include: { studyDesign: true } },
  corrections: { orderBy: { createdAt: 'desc' }, select: { id: true, comment: true, createdAt: true } },
} satisfies Prisma.ProtocolInclude;

export type ProtocolWithRelations = Prisma.ProtocolGetPayload<{ include: typeof PROTOCOL_INCLUDE }>;

// Vista reducida para el investigador: solo sus revisiones y sin montos ni revisor.
export const RESEARCHER_PROTOCOL_DETAIL_INCLUDE = {
  investigadorPrincipal: true,
  protocoloOriginal: { select: { id: true, nroExpediente: true } },
  corrections: { orderBy: { createdAt: 'desc' }, select: { id: true, comment: true, createdAt: true } },
  reviews: {
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      committee: true,
      outcome: true,
      observations: true,
      observationItems: {
        select: { type: true, text: true },
        orderBy: [{ type: 'asc' }, { createdAt: 'asc' }],
      },
      createdAt: true,
    },
  },
} satisfies Prisma.ProtocolInclude;

export type ResearcherProtocolDetail = Prisma.ProtocolGetPayload<{
  include: typeof RESEARCHER_PROTOCOL_DETAIL_INCLUDE;
}>;
