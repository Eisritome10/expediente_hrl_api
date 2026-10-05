import { PrismaService } from '../../../../prisma/prisma.service';
import { FindResearcherProtocolByIdFeature } from '../find-researcher-protocol-by-id.feature';
import { ResearcherAccountNotLinkedException } from '../../exceptions/researcher-account-not-linked.exception';
import { ProtocolNotFoundException } from '../../exceptions/protocol-not-found.exception';
import { RESEARCHER_PROTOCOL_DETAIL_INCLUDE } from '../../protocol.include';
import { researcherParticipationWhere } from '../list-researcher-protocols.feature';
import { ResearcherProtocolDetailResponseDto } from '../../dtos/response/researcher-protocol-detail.response.dto';

describe('FindResearcherProtocolByIdFeature', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    protocol: { findFirst: jest.fn() },
  } as unknown as PrismaService;

  const feature = new FindResearcherProtocolByIdFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws ResearcherAccountNotLinkedException when the user does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('u1', 'p1')).rejects.toBeInstanceOf(ResearcherAccountNotLinkedException);
    expect(prisma.protocol.findFirst).not.toHaveBeenCalled();
  });

  it('throws ResearcherAccountNotLinkedException when the user has no researcherId', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ researcherId: null });

    await expect(feature.execute('u1', 'p1')).rejects.toBeInstanceOf(ResearcherAccountNotLinkedException);
    expect(prisma.protocol.findFirst).not.toHaveBeenCalled();
  });

  it('throws ProtocolNotFoundException when the protocol does not belong to the researcher', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ researcherId: 'r1' });
    (prisma.protocol.findFirst as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('u1', 'p1')).rejects.toBeInstanceOf(ProtocolNotFoundException);
  });

  it('returns the protocol detail when it belongs to the researcher', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ researcherId: 'r1' });
    const protocol = { id: 'p1' };
    (prisma.protocol.findFirst as jest.Mock).mockResolvedValue(protocol);

    await expect(feature.execute('u1', 'p1')).resolves.toEqual(protocol);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'u1' },
      select: { researcherId: true },
    });
    expect(prisma.protocol.findFirst).toHaveBeenCalledWith({
      where: { id: 'p1', ...researcherParticipationWhere('r1') },
      include: RESEARCHER_PROTOCOL_DETAIL_INCLUDE,
    });
  });

  it('exposes a legacy free-text review as a single observation without type once mapped to the response', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ researcherId: 'r1' });
    const createdAt = new Date('2026-03-01T00:00:00.000Z');
    (prisma.protocol.findFirst as jest.Mock).mockResolvedValue({
      id: 'p1',
      nroExpediente: '542/2026',
      titulo: 'ESTUDIO',
      fechaRecepcion: createdAt,
      status: 'CIC_OBSERVED',
      investigadorPrincipal: { id: 'r1', dni: '12345678', firstName: 'ROSA', lastName: 'PINEDO' },
      esEnmienda: false,
      protocoloOriginal: null,
      corrections: [],
      reviews: [
        {
          id: 'v1',
          committee: 'CIC',
          outcome: 'OBSERVED',
          observations: 'TEXTO VIEJO',
          observationItems: [],
          createdAt,
        },
      ],
      createdAt,
      updatedAt: createdAt,
    });

    const detail = await feature.execute('u1', 'p1');
    const dto = ResearcherProtocolDetailResponseDto.from(detail);

    expect(dto.reviews[0].observations).toEqual([{ type: null, text: 'TEXTO VIEJO' }]);
  });
});
