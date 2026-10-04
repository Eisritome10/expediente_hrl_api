import { InstitutionType, LineType, Prisma, ProtocolStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateProtocolFeature, CreateProtocolInput } from '../create-protocol.feature';
import { ProtocolInvalidReferenceException } from '../../exceptions/protocol-invalid-reference.exception';
import { ProtocolOriginalNotAmendableException } from '../../exceptions/protocol-original-not-amendable.exception';
import { ProtocolInvalidResearchLineException } from '../../exceptions/protocol-invalid-research-line.exception';
import { ProtocolNroExpedienteAlreadyExistsException } from '../../exceptions/protocol-nro-expediente-already-exists.exception';
import { ProtocoloInvestigadorDuplicadoException } from '../../exceptions/protocolo-investigador-duplicado.exception';
import { ProtocoloFacultadRequiereUniversidadException } from '../../exceptions/protocolo-facultad-requiere-universidad.exception';
import { ProtocoloMemosNoAplicablesException } from '../../exceptions/protocolo-memos-no-aplicables.exception';
import { ProtocoloLugarEjecucionInconsistenteException } from '../../exceptions/protocolo-lugar-ejecucion-inconsistente.exception';
import { ProtocoloConstanciaEticaIncompletaException } from '../../exceptions/protocolo-constancia-etica-incompleta.exception';
import { ProtocoloFacultadNoPerteneceInstitucionException } from '../../exceptions/protocolo-facultad-no-pertenece-institucion.exception';

describe('CreateProtocolFeature', () => {
  const prisma = {
    researcher: { findUnique: jest.fn(), count: jest.fn() },
    institution: { findUnique: jest.fn() },
    faculty: { findUnique: jest.fn() },
    agreement: { findUnique: jest.fn() },
    researchLine: { findUnique: jest.fn() },
    modality: { findUnique: jest.fn() },
    destination: { count: jest.fn() },
    studyDesign: { count: jest.fn() },
    protocol: { create: jest.fn(), findUnique: jest.fn() },
  } as unknown as PrismaService;

  const feature = new CreateProtocolFeature(prisma);

  const input: CreateProtocolInput = {
    nroExpediente: '542/2026',
    fechaRecepcion: new Date('2026-01-15'),
    titulo: 'ESTUDIO DE PRUEBA',
    lugarEjecucion: 'HRL',
    esInstitucional: true,
    investigadorPrincipalId: 'r1',
    coinvestigadorIds: ['r2'],
    asesorIds: ['r3'],
    institucionId: 'i1',
    facultadId: 'f1',
    destinoIds: ['d1'],
    studyDesignIds: ['sd1'],
    lineaHrlId: 'lh1',
    lineaMeta2030Id: 'lm1',
    modalidadId: 'm1',
    convenioId: null,
    pagoRevision: 150,
    tipoComprobante: 'BOLETA',
    comprobanteRevision: 'B001-123',
    protocoloOriginalId: null,
    requiereRevisionHc: false,
    montoHc: null,
    tipoComprobanteHc: null,
    nroComprobanteHc: null,
    tieneConstanciaEtica: false,
    idConstanciaEtica: null,
    fechaConstancia: null,
    consentimientoInformado: false,
    departamentoDirigidoPermiso: null,
    certificadoBuenasPracticas: false,
  };

  const mockValidReferences = () => {
    (prisma.researcher.findUnique as jest.Mock).mockResolvedValue({ id: 'r1' });
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: 'i1', type: InstitutionType.UNIVERSITY });
    (prisma.faculty.findUnique as jest.Mock).mockResolvedValue({ id: 'f1', institutionId: 'i1' });
    (prisma.researchLine.findUnique as jest.Mock)
      .mockResolvedValueOnce({ id: 'lh1', type: LineType.HRL })
      .mockResolvedValueOnce({ id: 'lm1', type: LineType.META_2030 });
    (prisma.modality.findUnique as jest.Mock).mockResolvedValue({ id: 'm1' });
    (prisma.researcher.count as jest.Mock).mockResolvedValue(1);
    (prisma.destination.count as jest.Mock).mockResolvedValue(1);
    (prisma.studyDesign.count as jest.Mock).mockResolvedValue(1);
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
          disenosEstudio: { create: [{ studyDesignId: 'sd1' }] },
        }),
      }),
    );
  });

  it('applies protocolo rules before validating references', async () => {
    await expect(
      feature.execute({ ...input, investigadorPrincipalId: 'r1', coinvestigadorIds: ['r1'] }),
    ).rejects.toBeInstanceOf(ProtocoloInvestigadorDuplicadoException);
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

  it('throws ProtocolInvalidReferenceException when a study design id does not exist', async () => {
    mockValidReferences();
    (prisma.studyDesign.count as jest.Mock).mockResolvedValue(0);

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

  it('throws ProtocolInvalidReferenceException when convenioId does not resolve', async () => {
    mockValidReferences();
    (prisma.agreement.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute({ ...input, convenioId: 'a1' })).rejects.toBeInstanceOf(
      ProtocolInvalidReferenceException,
    );
  });

  it('writes the payment and the ethics documentation, marks esEnmienda false and never writes review purpose or date', async () => {
    mockValidReferences();
    (prisma.protocol.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute({
      ...input,
      tieneConstanciaEtica: true,
      idConstanciaEtica: 'CE-2026-045',
      fechaConstancia: new Date('2026-01-10'),
      consentimientoInformado: true,
      departamentoDirigidoPermiso: 'GINECO-OBSTETRICIA',
    });

    const dataArg = (prisma.protocol.create as jest.Mock).mock.calls[0][0].data;
    expect(dataArg.esEnmienda).toBe(false);
    expect(dataArg.protocoloOriginal).toBeUndefined();
    expect(dataArg).toMatchObject({
      pagoRevision: 150,
      tipoComprobante: 'BOLETA',
      comprobanteRevision: 'B001-123',
      tieneConstanciaEtica: true,
      idConstanciaEtica: 'CE-2026-045',
      consentimientoInformado: true,
      departamentoDirigidoPermiso: 'GINECO-OBSTETRICIA',
    });
    expect(dataArg.propositoRevision).toBeUndefined();
    expect(dataArg.fechaRevision).toBeUndefined();
  });

  it('throws ProtocoloConstanciaEticaIncompletaException when tieneConstanciaEtica is true without code or date', async () => {
    await expect(
      feature.execute({ ...input, tieneConstanciaEtica: true, idConstanciaEtica: null, fechaConstancia: null }),
    ).rejects.toBeInstanceOf(ProtocoloConstanciaEticaIncompletaException);
    expect(prisma.protocol.create).not.toHaveBeenCalled();
  });

  it('keeps the good practices certificate only when requiereRevisionHc is true', async () => {
    mockValidReferences();
    (prisma.protocol.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute({ ...input, certificadoBuenasPracticas: true });
    expect((prisma.protocol.create as jest.Mock).mock.calls[0][0].data.certificadoBuenasPracticas).toBe(false);

    mockValidReferences();
    await feature.execute({
      ...input,
      requiereRevisionHc: true,
      montoHc: 50,
      tipoComprobanteHc: 'BOLETA',
      nroComprobanteHc: 'B001-123',
      certificadoBuenasPracticas: true,
    });
    expect((prisma.protocol.create as jest.Mock).mock.calls[1][0].data.certificadoBuenasPracticas).toBe(true);
  });

  it('connects the FINALIZED original protocol and marks the record as an amendment', async () => {
    mockValidReferences();
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({ id: 'orig1', status: ProtocolStatus.FINALIZED });
    (prisma.protocol.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute({ ...input, protocoloOriginalId: 'orig1' });

    expect(prisma.protocol.findUnique).toHaveBeenCalledWith({
      where: { id: 'orig1' },
      select: { id: true, status: true },
    });
    expect(prisma.protocol.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          esEnmienda: true,
          pagoRevision: 0,
          tipoComprobante: null,
          comprobanteRevision: null,
          protocoloOriginal: { connect: { id: 'orig1' } },
        }),
      }),
    );
  });

  it('throws ProtocolInvalidReferenceException when the original protocol does not exist', async () => {
    mockValidReferences();
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute({ ...input, protocoloOriginalId: 'missing' })).rejects.toBeInstanceOf(
      ProtocolInvalidReferenceException,
    );
  });

  it('throws ProtocolOriginalNotAmendableException when the original protocol is not FINALIZED', async () => {
    mockValidReferences();
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({ id: 'orig1', status: ProtocolStatus.CIC_OBSERVED });

    await expect(feature.execute({ ...input, protocoloOriginalId: 'orig1' })).rejects.toBeInstanceOf(
      ProtocolOriginalNotAmendableException,
    );
  });

  it('accepts a FINALIZED amendment as the original of another amendment', async () => {
    mockValidReferences();
    (prisma.protocol.findUnique as jest.Mock).mockResolvedValue({ id: 'ema1', status: ProtocolStatus.FINALIZED });
    (prisma.protocol.create as jest.Mock).mockResolvedValue({ id: 'p2' });

    await expect(feature.execute({ ...input, protocoloOriginalId: 'ema1' })).resolves.toEqual({ id: 'p2' });
  });

  it('connects the agreement and exonerates the payment when convenioId resolves', async () => {
    mockValidReferences();
    (prisma.agreement.findUnique as jest.Mock).mockResolvedValue({ id: 'a1' });
    (prisma.protocol.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute({ ...input, convenioId: 'a1' });

    const dataArg = (prisma.protocol.create as jest.Mock).mock.calls[0][0].data;
    expect(dataArg.convenio).toEqual({ connect: { id: 'a1' } });
    expect(dataArg.pagoRevision).toBe(0);
    expect(dataArg.tipoComprobante).toBeNull();
    expect(dataArg.comprobanteRevision).toBeNull();
  });

  it('does not look up an agreement or connect it when convenioId is null', async () => {
    mockValidReferences();
    (prisma.protocol.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute({ ...input, convenioId: null });

    expect(prisma.agreement.findUnique).not.toHaveBeenCalled();
    expect(prisma.protocol.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ convenio: undefined }) }),
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
      nroComprobanteHc: 'B001-123',
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
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: 'i1', type: InstitutionType.HOSPITAL });

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ProtocoloFacultadRequiereUniversidadException);
  });

  it('throws ProtocoloFacultadRequiereUniversidadException when facultadId is set without an institucionId', async () => {
    mockValidReferences();

    await expect(feature.execute({ ...input, institucionId: null })).rejects.toBeInstanceOf(
      ProtocoloFacultadRequiereUniversidadException,
    );
  });

  it('throws ProtocoloFacultadNoPerteneceInstitucionException when the faculty belongs to another university', async () => {
    mockValidReferences();
    (prisma.faculty.findUnique as jest.Mock).mockResolvedValue({ id: 'f1', institutionId: 'other-university' });

    await expect(feature.execute(input)).rejects.toBeInstanceOf(ProtocoloFacultadNoPerteneceInstitucionException);
    expect(prisma.protocol.create).not.toHaveBeenCalled();
  });

  it('accepts a faculty that belongs to the selected university', async () => {
    mockValidReferences();
    (prisma.faculty.findUnique as jest.Mock).mockResolvedValue({ id: 'f1', institutionId: 'i1' });
    (prisma.protocol.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    await expect(feature.execute(input)).resolves.toEqual({ id: 'p1' });
  });

  it('keeps accepting historical faculties without university', async () => {
    mockValidReferences();
    (prisma.faculty.findUnique as jest.Mock).mockResolvedValue({ id: 'f1', institutionId: null });
    (prisma.protocol.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    await expect(feature.execute(input)).resolves.toEqual({ id: 'p1' });
  });

  it('does not require a university when facultadId is not provided', async () => {
    mockValidReferences();
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: 'i1', type: InstitutionType.HOSPITAL });
    (prisma.protocol.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    await expect(feature.execute({ ...input, facultadId: null })).resolves.toEqual({ id: 'p1' });
  });
});
