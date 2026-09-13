import { PrismaService } from '../../../../prisma/prisma.service';
import { ListProtocolsFeature } from '../list-protocols.feature';

describe('ListProtocolsFeature', () => {
  const prisma = { protocol: { findMany: jest.fn(), count: jest.fn() } } as unknown as PrismaService;
  const feature = new ListProtocolsFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('resolves pagination and returns data with meta', async () => {
    const data = [{ id: 'p1' }, { id: 'p2' }];
    (prisma.protocol.findMany as jest.Mock).mockResolvedValue(data);
    (prisma.protocol.count as jest.Mock).mockResolvedValue(2);

    const result = await feature.execute(1, 10);

    expect(result).toEqual({ data, page: 1, limit: 10, total: 2 });
  });

  it('defaults to page 1 / limit 10 when nothing is provided', async () => {
    (prisma.protocol.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.protocol.count as jest.Mock).mockResolvedValue(0);

    const result = await feature.execute();

    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  it('builds the where clause from the given filters', async () => {
    (prisma.protocol.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.protocol.count as jest.Mock).mockResolvedValue(0);

    const desde = new Date('2026-01-01');
    const hasta = new Date('2026-12-31');

    await feature.execute(1, 10, {
      nroExpediente: '542',
      investigadorPrincipalId: 'r1',
      fechaRecepcionDesde: desde,
      fechaRecepcionHasta: hasta,
    });

    expect(prisma.protocol.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          nroExpediente: { contains: '542', mode: 'insensitive' },
          investigadorPrincipalId: 'r1',
          fechaRecepcion: { gte: desde, lte: hasta },
        },
      }),
    );
  });
});
