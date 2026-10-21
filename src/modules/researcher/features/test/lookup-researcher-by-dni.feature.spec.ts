import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../../prisma/prisma.service';
import { LookupResearcherByDniFeature } from '../lookup-researcher-by-dni.feature';
import { ReniecDniNotFoundException } from '../../exceptions/reniec-dni-not-found.exception';
import { ReniecNotConfiguredException } from '../../exceptions/reniec-not-configured.exception';
import { ReniecUnavailableException } from '../../exceptions/reniec-unavailable.exception';
import { ResearcherDniAlreadyExistsException } from '../../exceptions/researcher-dni-already-exists.exception';

describe('LookupResearcherByDniFeature', () => {
  const prisma = { researcher: { findUnique: jest.fn() } } as unknown as PrismaService;
  const settings: Record<string, string> = {
    'reniec.baseUrl': 'https://reniec.test/api/pacientes',
    'reniec.token': 'secret',
  };
  const configService = { get: jest.fn((key: string) => settings[key]) } as unknown as ConfigService;
  const feature = new LookupResearcherByDniFeature(prisma, configService);
  const fetchMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (prisma.researcher.findUnique as jest.Mock).mockResolvedValue(null);
    global.fetch = fetchMock as unknown as typeof fetch;
    settings['reniec.token'] = 'secret';
  });

  const ok = (body: unknown) => ({ ok: true, status: 200, json: () => Promise.resolve(body) });

  it('returns uppercased names and both surnames using the bearer token', async () => {
    fetchMock.mockResolvedValue(
      ok({ encontrado: true, paciente: { dni: '12345678', nombres: 'Ana María', ap_pat: 'Pérez', ap_mat: 'Ríos' } }),
    );

    await expect(feature.execute('12345678')).resolves.toEqual({
      dni: '12345678',
      firstName: 'ANA MARÍA',
      lastName: 'PÉREZ RÍOS',
    });
    expect(fetchMock).toHaveBeenCalledWith(
      'https://reniec.test/api/pacientes/12345678',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer secret' }) }),
    );
  });

  it('keeps every given name and both surnames, including compound ones', async () => {
    fetchMock.mockResolvedValue(
      ok({
        encontrado: true,
        paciente: { nombres: 'Juan  Carlos Alberto', ap_pat: 'De la Cruz', ap_mat: 'Quispe Huamán' },
      }),
    );

    await expect(feature.execute('12345678')).resolves.toMatchObject({
      firstName: 'JUAN CARLOS ALBERTO',
      lastName: 'DE LA CRUZ QUISPE HUAMÁN',
    });
  });

  it('works when there is no second surname', async () => {
    fetchMock.mockResolvedValue(ok({ encontrado: true, paciente: { nombres: 'Juan', ap_pat: 'Soto', ap_mat: ' ' } }));

    await expect(feature.execute('12345678')).resolves.toMatchObject({ lastName: 'SOTO' });
  });

  it('fails as not configured without a token, before any request', async () => {
    settings['reniec.token'] = '';

    await expect(feature.execute('12345678')).rejects.toBeInstanceOf(ReniecNotConfiguredException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects a DNI that is already registered without calling RENIEC', async () => {
    (prisma.researcher.findUnique as jest.Mock).mockResolvedValue({ id: 'r1' });

    await expect(feature.execute('12345678')).rejects.toBeInstanceOf(ResearcherDniAlreadyExistsException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('maps a 404 and an empty result to not found', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 404 });
    await expect(feature.execute('12345678')).rejects.toBeInstanceOf(ReniecDniNotFoundException);

    fetchMock.mockResolvedValueOnce(ok({ encontrado: false, paciente: null }));
    await expect(feature.execute('12345678')).rejects.toBeInstanceOf(ReniecDniNotFoundException);
  });

  it('maps provider errors, invalid tokens and network failures to unavailable', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(feature.execute('12345678')).rejects.toBeInstanceOf(ReniecUnavailableException);

    fetchMock.mockResolvedValueOnce({ ok: false, status: 502 });
    await expect(feature.execute('12345678')).rejects.toBeInstanceOf(ReniecUnavailableException);

    fetchMock.mockRejectedValueOnce(new Error('timeout'));
    await expect(feature.execute('12345678')).rejects.toBeInstanceOf(ReniecUnavailableException);
  });
});
