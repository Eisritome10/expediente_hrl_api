import { ConflictException } from '@nestjs/common';
import { ProtocolStatus } from '@prisma/client';
import { FindResearcherProtocolByIdFeature } from '../find-researcher-protocol-by-id.feature';
import { GenerateResearcherEthicsCertificateFeature } from '../generate-researcher-ethics-certificate.feature';

describe('GenerateResearcherEthicsCertificateFeature', () => {
  const findResearcherProtocolByIdFeature = {
    execute: jest.fn(),
  } as unknown as FindResearcherProtocolByIdFeature;
  const feature = new GenerateResearcherEthicsCertificateFeature(findResearcherProtocolByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects a protocol that has not been finalized by the CIEI', async () => {
    (findResearcherProtocolByIdFeature.execute as jest.Mock).mockResolvedValue({
      status: ProtocolStatus.CIC_CORRECTED,
      reviews: [],
    });

    await expect(feature.execute('user-1', 'protocol-1')).rejects.toBeInstanceOf(ConflictException);
  });

  it('generates a PDF after the CIEI finalizes the protocol', async () => {
    (findResearcherProtocolByIdFeature.execute as jest.Mock).mockResolvedValue({
      status: ProtocolStatus.FINALIZED,
      nroExpediente: '123/2026',
      titulo: 'Estudio de investigación',
      investigadorPrincipal: { firstName: 'Ana', lastName: 'Pérez' },
      modalidad: { name: 'Pregrado' },
      catalogadoRiesgo: 'MINIMAL_RISK',
      reviews: [{ committee: 'CIEI', outcome: 'FINALIZED', createdAt: new Date('2026-10-15T12:00:00Z') }],
    });

    const pdf = await feature.execute('user-1', 'protocol-1');

    expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
    expect(findResearcherProtocolByIdFeature.execute).toHaveBeenCalledWith('user-1', 'protocol-1');
  });
});