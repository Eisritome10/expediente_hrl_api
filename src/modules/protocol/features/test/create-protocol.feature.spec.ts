import { LineType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateProtocolFeature, CreateProtocolInput } from '../create-protocol.feature';
import { ProtocolInvalidReferenceException } from '../../exceptions/protocol-invalid-reference.exception';
import { ProtocolInvalidResearchLineException } from '../../exceptions/protocol-invalid-research-line.exception';
import { ProtocolNroExpedienteAlreadyExistsException } from '../../exceptions/protocol-nro-expediente-already-exists.exception';
import { ProtocoloConvenioSinNombreException } from '../../exceptions/protocolo-convenio-sin-nombre.exception';
import { ProtocoloFacultadRequiereUniversidadException } from '../../exceptions/protocolo-facultad-requiere-universidad.exception';
import { ProtocoloMemosNoAplicablesException } from '../../exceptions/protocolo-memos-no-aplicables.exception';
import { ProtocoloLugarEjecucionInconsistenteException } from '../../exceptions/protocolo-lugar-ejecucion-inconsistente.exception';

describe('CreateProtocolFeature', () => {
  const prisma = {
    researcher: { findUnique: jest.fn(), count: jest.fn() },
    institution: { findUnique: jest.fn() },
    faculty: { findUnique: jest.fn() },
    researchLine: { findUnique: jest.fn() },
    modality: { findUnique: jest.fn() },
    destination: { count: jest.fn() },
    protocol: { create: jest.fn() },
  } as unknown as PrismaService;

  const feature = new CreateProtocolFeature(prisma);

  const input: CreateProtocolInput = {
    nroExpediente: '542/2026',
    fechaRecepcion: new Date('2026-01-15'),
    titulo: 'ESTUDIO DE PRUEBA',
    disenoEstudio: 'DESCRIPTIVO',
    lugarEjecucion: 'HRL',
    esInstitucional: true,
    investigadorPrincipalId: 'r1',
    coinvestigadorIds: ['r2'],
    asesorIds: ['r3'],
    institucionId: 'i1',
    facultadId: 'f1',
    destinoIds: ['d1'],
    lineaHrlId: 'lh1',
    lineaMeta2030Id: 'lm1',
    modalidadId: 'm1',
    propositoRevision: 'REVISION INICIAL',
    fechaRevision: null,
    tipoComprobante: null,
    comprobanteRevision: null,
    pagoRevision: 150,
    esEnmienda: false,
    esConvenio: false,
    nombreConvenio: null,
    requiereRevisionHc: false,
    montoHc: null,
    tipoComprobanteHc: null,
    nroComprobanteHc: null,
    certificadoBuenasPracticas: false,
  };

  const mockValidReferences = () => {
    (prisma.researcher.findUnique as jest.Mock).mockResolvedValue({ id: 'r1' });
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: 'i1', esUniversidad: true });
    (prisma.faculty.findUnique as jest.Mock).mockResolvedValue({ id: 'f1' });
    (prisma.researchLine.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'lh1', type: LineType.HRL })
      .mockResolvedValueOnce({ id: 'lm1', type: LineType.META_2030 });
    (prisma.modality.findUnique as jest.Mock).mockResolvedValue({ id: 'm1' });
    (prisma.researcher.count as jest.Mock).mockResolvedValue(1);
    (prisma.destination.count as jest.Mock).mockResolvedValue(1);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a protocol with the resolved relations', async () => {
    mockValidReferences();
    const created = { id: 'p1' };
    (prisma.protocol.create as jest.Mock).mockResolvedValue(created);

    await expect(feature.execute(input)).resolves.toEqual(created);
    expect(prisma.protocol.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          nroExpediente: input.nroExpediente,
          investigadorPrincipal: { connect: { id: 'r1' } },
          institucion: { connect: { id: 'i1' } },
          facultad: { connect: { id: 'f1' } },
          lineaHrl: { connect: { id: 'lh1' } },
          lineaMeta2030: { connect: { id: 'lm1' } },
          modalidad: { connect: { id: 'm1' } },
          coinvestigadores: { create: [{ researcherId: 'r2' }] },
          asesores: { create: [{ researcherId: 'r3' }] },
          destinos: { create: [{ destinationId: 'd1' }] },
        }),
      }),
    );
  });

  it('applies protocolo rules before validating references', async () => {
    await expect(feature.execute({ ...input, esConvenio: true, nombreConvenio: null })).rejects.toBeInstanceOf(
      ProtocoloConvenioSinNombreException,
    );
    expect(prisma.researcher.findUnique).not.toHaveBeenCalled();
  });

  it('throws ProtocolInvalidReferenceException when investigadorPrincipalId does not resolve', async () => {
    mockValidReferences();
    (prisma.researcher.findUnique as jest.Mock).mockResolvedValueOnce(null);

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ProtocolInvalidReferenceException);
  });

  it('throws ProtocolInvalidReferenceException when institucionId does not resolve', async () => {
    mockValidReferences();
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ProtocolInvalidReferenceException);
  });

  it('throws ProtocolInvalidResearchLineException when lineaHrlId resolves to the wrong type', async () => {
    mockValidReferences();
    (prisma.researchLine.findUnique as jest.Mock).mockReset();
    (prisma.researchLine.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'lh1', type: LineType.META_2030 })
      .mockResolvedValueOnce({ id: 'lm1', type: LineType.META_2030 });

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ProtocolInvalidResearchLineException);
  });

  it('throws ProtocolInvalidResearchLineException when lineaMeta2030Id resolves to the wrong type', async () => {
    mockValidReferences();
    (prisma.researchLine.findUnique as jest.Mock).mockReset();
    (prisma.researchLine.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'lh1', type: LineType.HRL })
      .mockResolvedValueOnce({ id: 'lm1', type: LineType.HRL });

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ProtocolInvalidResearchLineException);
  });

  it('throws ProtocolInvalidReferenceException when a coinvestigador id does not exist', async () => {
    mockValidReferences();
    (prisma.researcher.count as jest.Mock).mockResolvedValue(0);

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ProtocolInvalidReferenceException);
  });

  it('throws ProtocolInvalidReferenceException when a destino id does not exist', async () => {
    mockValidReferences();
    (prisma.destination.count as jest.Mock).mockResolvedValue(0);

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ProtocolInvalidReferenceException);
  });

  it('throws ProtocolNroExpedienteAlreadyExistsException on a duplicate nroExpediente', async () => {
    mockValidReferences();
    (prisma.protocol.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'protocols_nro_expediente_key' } } } },
      }),
    );

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ProtocolNroExpedienteAlreadyExistsException);
  });

  it('forces pagoRevision to 0 when esConvenio is true', async () => {
    mockValidReferences();
    (prisma.protocol.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute({ ...input, esConvenio: true, nombreConvenio: 'Universidad X', pagoRevision: 150 });

    expect(prisma.protocol.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ pagoRevision: 0 }) }),
    );
  });

  it('nulls HC fields when requiereRevisionHc is false even if values were passed', async () => {
    mockValidReferences();
    (prisma.protocol.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute({
      ...input,
      requiereRevisionHc: false,
      montoHc: 50,
      tipoComprobanteHc: 'BOLETA',
      nroComprobanteHc: '001',
    });

    expect(prisma.protocol.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ montoHc: null, tipoComprobanteHc: null, nroComprobanteHc: null }),
      }),
    );
  });

  it('throws ProtocoloMemosNoAplicablesException when esInstitucional is false and destinos were passed', async () => {
    await expect(
      feature.execute({ ...input, esInstitucional: false, destinoIds: ['d1'], lugarEjecucion: 'CLINICA SAN JUAN' }),
    ).rejects.toBeInstanceOf(ProtocoloMemosNoAplicablesException);
    expect(prisma.researcher.findUnique).not.toHaveBeenCalled();
  });

  it('throws ProtocoloLugarEjecucionInconsistenteException when esInstitucional is false and lugarEjecucion mentions Hospital Regional', async () => {
    await expect(
      feature.execute({ ...input, esInstitucional: false, destinoIds: [], lugarEjecucion: 'HOSPITAL REGIONAL DE LORETO' }),
    ).rejects.toBeInstanceOf(ProtocoloLugarEjecucionInconsistenteException);
    expect(prisma.researcher.findUnique).not.toHaveBeenCalled();
  });

  it('throws ProtocoloFacultadRequiereUniversidadException when the institucion is not a university', async () => {
    mockValidReferences();
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: 'i1', esUniversidad: false });

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ProtocoloFacultadRequiereUniversidadException);
  });

  it('throws ProtocoloFacultadRequiereUniversidadException when facultadId is set without an institucionId', async () => {
    mockValidReferences();

    await expect(feature.execute({ ...input, institucionId: null })).rejects.toBeInstanceOf(
      ProtocoloFacultadRequiereUniversidadException,
    );
  });

  it('does not require a university when facultadId is not provided', async () => {
    mockValidReferences();
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: 'i1', esUniversidad: false });
    (prisma.protocol.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    await expect(feature.execute({ ...input, facultadId: null })).resolves.toEqual({ id: 'p1' });
  });
});
