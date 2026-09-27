import { LineType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ProtocolInvalidReferenceException } from './exceptions/protocol-invalid-reference.exception';
import { ProtocolInvalidResearchLineException } from './exceptions/protocol-invalid-research-line.exception';
import { ProtocoloFacultadRequiereUniversidadException } from './exceptions/protocolo-facultad-requiere-universidad.exception';

export type ProtocolReferencesInput = {
  investigadorPrincipalId: string;
  institucionId: string | null;
  facultadId: string | null;
  convenioId: string | null;
  lineaHrlId: string;
  lineaMeta2030Id: string;
  modalidadId: string;
  coinvestigadorIds: string[];
  asesorIds: string[];
  destinoIds: string[];
  studyDesignIds: string[];
};

export async function validateProtocolReferences(
  prisma: PrismaService,
  input: ProtocolReferencesInput,
): Promise<void> {
  const [
    investigador,
    institucion,
    facultad,
    convenio,
    lineaHrl,
    lineaMeta2030,
    modalidad,
    coinvestigadoresCount,
    asesoresCount,
    destinosCount,
    studyDesignsCount,
  ] = await Promise.all([
    prisma.researcher.findUnique({ where: { id: input.investigadorPrincipalId } }),
    input.institucionId ? prisma.institution.findUnique({ where: { id: input.institucionId } }) : null,
    input.facultadId ? prisma.faculty.findUnique({ where: { id: input.facultadId } }) : null,
    input.convenioId ? prisma.agreement.findUnique({ where: { id: input.convenioId } }) : null,
    prisma.researchLine.findUnique({ where: { id: input.lineaHrlId } }),
    prisma.researchLine.findUnique({ where: { id: input.lineaMeta2030Id } }),
    prisma.modality.findUnique({ where: { id: input.modalidadId } }),
    input.coinvestigadorIds.length ? prisma.researcher.count({ where: { id: { in: input.coinvestigadorIds } } }) : 0,
    input.asesorIds.length ? prisma.researcher.count({ where: { id: { in: input.asesorIds } } }) : 0,
    input.destinoIds.length ? prisma.destination.count({ where: { id: { in: input.destinoIds } } }) : 0,
    input.studyDesignIds.length ? prisma.studyDesign.count({ where: { id: { in: input.studyDesignIds } } }) : 0,
  ]);

  if (!investigador) throw new ProtocolInvalidReferenceException('Researcher', input.investigadorPrincipalId);
  if (input.institucionId && !institucion) {
    throw new ProtocolInvalidReferenceException('Institution', input.institucionId);
  }
  if (input.facultadId && !facultad) throw new ProtocolInvalidReferenceException('Faculty', input.facultadId);
  if (input.convenioId && !convenio) throw new ProtocolInvalidReferenceException('Agreement', input.convenioId);

  if (!lineaHrl) throw new ProtocolInvalidReferenceException('ResearchLine', input.lineaHrlId);
  if (lineaHrl.type !== LineType.HRL) throw new ProtocolInvalidResearchLineException('lineaHrlId', LineType.HRL);

  if (!lineaMeta2030) throw new ProtocolInvalidReferenceException('ResearchLine', input.lineaMeta2030Id);
  if (lineaMeta2030.type !== LineType.META_2030) {
    throw new ProtocolInvalidResearchLineException('lineaMeta2030Id', LineType.META_2030);
  }

  if (!modalidad) throw new ProtocolInvalidReferenceException('Modality', input.modalidadId);

  if (input.facultadId && (!institucion || !institucion.esUniversidad)) {
    throw new ProtocoloFacultadRequiereUniversidadException();
  }

  if (coinvestigadoresCount !== new Set(input.coinvestigadorIds).size) {
    throw new ProtocolInvalidReferenceException('Researcher', 'coinvestigadorIds');
  }
  if (asesoresCount !== new Set(input.asesorIds).size) {
    throw new ProtocolInvalidReferenceException('Researcher', 'asesorIds');
  }
  if (destinosCount !== new Set(input.destinoIds).size) {
    throw new ProtocolInvalidReferenceException('Destination', 'destinoIds');
  }
  if (studyDesignsCount !== new Set(input.studyDesignIds).size) {
    throw new ProtocolInvalidReferenceException('StudyDesign', 'studyDesignIds');
  }
}
