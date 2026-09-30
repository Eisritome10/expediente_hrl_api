import { PrismaService } from '../../../../prisma/prisma.service';
import { ListResearcherProtocolsFeature } from '../list-researcher-protocols.feature';
import { ResearcherAccountNotLinkedException } from '../../exceptions/researcher-account-not-linked.exception';

describe('ListResearcherProtocolsFeature', () => {
  const prisma = {
    user: { findUnique: jest.fn() },
    protocol: { findMany: jest.fn(), count: jest.fn() },
  } as unknown as PrismaService;
  const feature = new ListResearcherProtocolsFeature(prisma);

  const participantWhere = {
    OR: [
      { investigadorPrincipalId: 'r1' },
      { coinvestigadores: { some: { researcherId: 'r1' } } },
      { asesores: { some: { researcherId: 'r1' } } },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws ResearcherAccountNotLinkedException when the user does not exist', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('u1')).rejects.toBeInstanceOf(ResearcherAccountNotLinkedException);
    expect(prisma.protocol.findMany).not.toHaveBeenCalled();
  });

  it('throws ResearcherAccountNotLinkedException when the user has no researcherId', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ researcherId: null });

    await expect(feature.execute('u1')).rejects.toBeInstanceOf(ResearcherAccountNotLinkedException);
    expect(prisma.protocol.findMany).not.toHaveBeenCalled();
  });

  it('lists the protocols where the researcher participates as principal, co-investigator or advisor', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ researcherId: 'r1' });
    const data = [{ id: 'p1' }, { id: 'p2' }];
    (prisma.protocol.findMany as jest.Mock).mockResolvedValue(data);
    (prisma.protocol.count as jest.Mock).mockResolvedValue(2);

    const result = await feature.execute('u1');

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'u1' },
      select: { researcherId: true },
    });
    expect(prisma.protocol.findMany).toHaveBeenCalledWith({
      where: participantWhere,
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { investigadorPrincipal: true },
    });
    expect(prisma.protocol.count).toHaveBeenCalledWith({ where: participantWhere });
    expect(result).toEqual({ data, page: 1, limit: 10, total: 2 });
  });

  it('applies the requested pagination to the query and the meta', async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ researcherId: 'r1' });
    (prisma.protocol.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.protocol.count as jest.Mock).mockResolvedValue(0);

    const result = await feature.execute('u1', 2, 25);

    expect(prisma.protocol.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 25, take: 25 }),
    );
    expect(result).toEqual({ data: [], page: 2, limit: 25, total: 0 });
  });
});
