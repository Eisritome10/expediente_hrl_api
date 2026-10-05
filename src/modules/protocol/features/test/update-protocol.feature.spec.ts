import { InstitutionType, LineType, Prisma, ProtocolStatus } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateProtocolFeature } from '../update-protocol.feature';
import { FindProtocolByIdFeature } from '../find-protocol-by-id.feature';
import { ProtocolNotFoundException } from '../../exceptions/protocol-not-found.exception';
import { ProtocolNotObservedException } from '../../exceptions/protocol-not-observed.exception';
import { ProtocolInvalidReferenceException } from '../../exceptions/protocol-invalid-reference.exception';
import { ProtocolNroExpedienteAlreadyExistsException } from '../../exceptions/protocol-nro-expediente-already-exists.exception';
import { ProtocoloInvestigadorDuplicadoException } from '../../exceptions/protocolo-investigador-duplicado.exception';
import { ProtocoloFacultadRequiereUniversidadException } from '../../exceptions/protocolo-facultad-requiere-universidad.exception';
import { ProtocoloMemosNoAplicablesException } from '../../exceptions/protocolo-memos-no-aplicables.exception';
import { ProtocoloConstanciaEticaIncompletaException } from '../../exceptions/protocolo-constancia-etica-incompleta.exception';
import { ProtocoloComprobanteInvalidoException } from '../../exceptions/protocolo-comprobante-invalido.exception';

describe('UpdateProtocolFeature', () => {
  const tx = {
    protocol: { updateMany: jest.fn(), update: jest.fn() },
    protocolCorrection: { create: jest.fn() },
  };

  const prisma = {
    researcher: { findUnique: jest.fn(), count: jest.fn() },
    institution: { findUnique: jest.fn() },
    faculty: { findUnique: jest.fn() },
    agreement: { findUnique: jest.fn() },
    researchLine: { findUnique: jest.fn() },
    modality: { findUnique: jest.fn() },
    destination: { count: jest.fn() },
    studyDesign: { count: jest.fn() },
    $transaction: jest.fn((cb: (tx: unknown) => unknown) => cb(tx)),
  } as unknown as PrismaService;

  const findProtocolByIdFeature = { execute: jest.fn() } as unknown as FindProtocolByIdFeature;
  const feature = new UpdateProtocolFeature(prisma, findProtocolByIdFeature);

  const observedProtocol = {
    id: 'p1',
    status: ProtocolStatus.CIC_OBSERVED,
    nroExpediente: '542/2026',
    fechaRecepcion: new Date('2026-01-15'),
    titulo: 'ESTUDIO DE PRUEBA',
    lugarEjecucion: 'HRL',
    esInstitucional: true,
    investigadorPrincipalId: 'r1',
    institucionId: 'i1',
    facultadId: 'f1',
    convenioId: null,
    lineaHrlId: 'lh1',
    lineaMeta2030Id: 'lm1',
    modalidadId: 'm1',
    propositoRevision: null,
    fechaRevision: null,
    tipoComprobante: 'BOLETA',
    comprobanteRevision: 'B001-123',
    pagoRevision: 150,
    tieneConstanciaEtica: false,
    idConstanciaEtica: null,
    fechaConstancia: null,
    consentimientoInformado: false,
    departamentoDirigidoPermiso: null,
    catalogadoRiesgo: null,
    esEnmienda: false,
    protocoloOriginalId: null,
    protocoloOriginal: null,
    requiereRevisionHc: false,
    montoHc: null,
    tipoComprobanteHc: null,
    nroComprobanteHc: null,
    certificadoBuenasPracticas: false,
    coinvestigadores: [{ researcherId: 'r2' }],
    asesores: [{ researcherId: 'r3' }],
    destinos: [{ destinationId: 'd1' }],
    disenosEstudio: [{ studyDesignId: 'sd1' }],
  } as unknown as import('../../protocol.include').ProtocolWithRelations;

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
    (findProtocolByIdFeature.execute as jest.Mock).mockResolvedValue(observedProtocol);
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 1 });
  });

  it('updates only the given field, keeping the rest and moving status to CIC_CORRECTED', async () => {
    mockValidReferences();
    const updated = { id: 'p1', status: ProtocolStatus.CIC_CORRECTED };
    (tx.protocol.update as jest.Mock).mockResolvedValue(updated);

    await expect(feature.execute('p1', { titulo: 'NUEVO TITULO' })).resolves.toEqual(updated);

    expect(tx.protocol.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: ProtocolStatus.CIC_OBSERVED },
      data: { status: ProtocolStatus.CIC_CORRECTED },
    });
    expect(tx.protocol.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: expect.objectContaining({
          titulo: 'NUEVO TITULO',
          nroExpediente: observedProtocol.nroExpediente,
          lugarEjecucion: observedProtocol.lugarEjecucion,
        }),
      }),
    );
    const dataArg = (tx.protocol.update as jest.Mock).mock.calls[0][0].data;
    expect(dataArg.coinvestigadores).toBeUndefined();
    expect(dataArg.asesores).toBeUndefined();
    expect(dataArg.destinos).toBeUndefined();
    expect(dataArg.disenosEstudio).toBeUndefined();
  });

  it('replaces only the relation whose array was sent', async () => {
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute('p1', { coinvestigadorIds: ['r4'] });

    const dataArg = (tx.protocol.update as jest.Mock).mock.calls[0][0].data;
    expect(dataArg.coinvestigadores).toEqual({ deleteMany: {}, create: [{ researcherId: 'r4' }] });
    expect(dataArg.asesores).toBeUndefined();
  });

  it('disconnects convenio when convenioId is set to null', async () => {
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute('p1', { convenioId: null });

    const dataArg = (tx.protocol.update as jest.Mock).mock.calls[0][0].data;
    expect(dataArg.convenio).toEqual({ disconnect: true });
  });

  it('connects convenio and forces the payment to 0 with no receipt', async () => {
    mockValidReferences();
    (prisma.agreement.findUnique as jest.Mock).mockResolvedValue({ id: 'a1' });
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute('p1', { convenioId: 'a1' });

    const dataArg = (tx.protocol.update as jest.Mock).mock.calls[0][0].data;
    expect(dataArg.convenio).toEqual({ connect: { id: 'a1' } });
    expect(dataArg.pagoRevision).toBe(0);
    expect(dataArg.tipoComprobante).toBeNull();
    expect(dataArg.comprobanteRevision).toBeNull();
  });

  it('keeps the current payment when it is not exonerated and the patch does not touch it', async () => {
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute('p1', { titulo: 'OTRO TITULO' });

    const dataArg = (tx.protocol.update as jest.Mock).mock.calls[0][0].data;
    expect(dataArg.pagoRevision).toBe(150);
    expect(dataArg.tipoComprobante).toBe('BOLETA');
    expect(dataArg.comprobanteRevision).toBe('B001-123');
  });

  it('writes a corrected payment when the patch sends it and the protocol is not exonerated', async () => {
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute('p1', { pagoRevision: 180, tipoComprobante: 'FACTURA', comprobanteRevision: 'F001-9' });

    const dataArg = (tx.protocol.update as jest.Mock).mock.calls[0][0].data;
    expect(dataArg.pagoRevision).toBe(180);
    expect(dataArg.tipoComprobante).toBe('FACTURA');
    expect(dataArg.comprobanteRevision).toBe('F001-9');
  });

  it('writes the corrected ethics documentation sent in the patch', async () => {
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });
    const fecha = new Date('2026-02-01');

    await feature.execute('p1', {
      tieneConstanciaEtica: true,
      idConstanciaEtica: 'CE-77',
      fechaConstancia: fecha,
      consentimientoInformado: true,
    });

    const dataArg = (tx.protocol.update as jest.Mock).mock.calls[0][0].data;
    expect(dataArg.tieneConstanciaEtica).toBe(true);
    expect(dataArg.idConstanciaEtica).toBe('CE-77');
    expect(dataArg.fechaConstancia).toBe(fecha);
    expect(dataArg.consentimientoInformado).toBe(true);
  });

  it('throws ProtocoloConstanciaEticaIncompletaException when the merged state declares a constancia without code', async () => {
    await expect(feature.execute('p1', { tieneConstanciaEtica: true })).rejects.toBeInstanceOf(
      ProtocoloConstanciaEticaIncompletaException,
    );
    expect(tx.protocol.update).not.toHaveBeenCalled();
  });

  it('clears the payment and the department when the patch sends explicit nulls', async () => {
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute('p1', {
      pagoRevision: null,
      tipoComprobante: null,
      comprobanteRevision: null,
      departamentoDirigidoPermiso: null,
    });

    const dataArg = (tx.protocol.update as jest.Mock).mock.calls[0][0].data;
    expect(dataArg.pagoRevision).toBeNull();
    expect(dataArg.tipoComprobante).toBeNull();
    expect(dataArg.comprobanteRevision).toBeNull();
    expect(dataArg.departamentoDirigidoPermiso).toBeNull();
  });

  it('does not keep a fake 0 payment when the patch removes the convenio of an exonerated protocol', async () => {
    (findProtocolByIdFeature.execute as jest.Mock).mockResolvedValue({
      ...observedProtocol,
      convenioId: 'a1',
      pagoRevision: 0,
      tipoComprobante: null,
      comprobanteRevision: null,
    });
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute('p1', { convenioId: null });

    const dataArg = (tx.protocol.update as jest.Mock).mock.calls[0][0].data;
    expect(dataArg.convenio).toEqual({ disconnect: true });
    expect(dataArg.pagoRevision).toBeNull();
  });

  it('does not block an unrelated correction when the stored receipt does not meet the format', async () => {
    (findProtocolByIdFeature.execute as jest.Mock).mockResolvedValue({
      ...observedProtocol,
      tipoComprobante: 'BOLETA',
      comprobanteRevision: '123',
    });
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await expect(feature.execute('p1', { titulo: 'OTRO TITULO' })).resolves.toEqual({ id: 'p1' });
  });

  it('validates the receipt format when the patch sends a corrected receipt', async () => {
    await expect(
      feature.execute('p1', { tipoComprobante: 'BOLETA', comprobanteRevision: 'F001-9' }),
    ).rejects.toBeInstanceOf(ProtocoloComprobanteInvalidoException);
    expect(tx.protocol.update).not.toHaveBeenCalled();
  });

  it('stores the correction comment as history in the same transaction when one is given', async () => {
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute('p1', { correctionComment: 'Se corrigió el consentimiento en el documento físico' });

    expect(tx.protocolCorrection.create).toHaveBeenCalledWith({
      data: { protocolId: 'p1', comment: 'Se corrigió el consentimiento en el documento físico' },
    });
    // El comentario no es un campo del protocolo.
    const dataArg = (tx.protocol.update as jest.Mock).mock.calls[0][0].data;
    expect(dataArg.correctionComment).toBeUndefined();
  });

  it('accepts a correction with only a comment and still moves the protocol to the corrected status', async () => {
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute('p1', { correctionComment: 'Corregido fuera del sistema' });

    expect(tx.protocol.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: ProtocolStatus.CIC_OBSERVED },
      data: { status: ProtocolStatus.CIC_CORRECTED },
    });
  });

  it('does not create a correction record when there is no comment', async () => {
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute('p1', { titulo: 'OTRO TITULO' });

    expect(tx.protocolCorrection.create).not.toHaveBeenCalled();
  });

  it('never writes review purpose, review date, risk level, amendment or original protocol', async () => {
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute('p1', { titulo: 'OTRO TITULO' });

    const dataArg = (tx.protocol.update as jest.Mock).mock.calls[0][0].data;
    expect(dataArg.propositoRevision).toBeUndefined();
    expect(dataArg.fechaRevision).toBeUndefined();
    expect(dataArg.catalogadoRiesgo).toBeUndefined();
    expect(dataArg.esEnmienda).toBeUndefined();
    expect(dataArg.protocoloOriginalId).toBeUndefined();
    expect(dataArg.protocoloOriginal).toBeUndefined();
  });

  it('propagates ProtocolNotFoundException without opening a transaction', async () => {
    (findProtocolByIdFeature.execute as jest.Mock).mockRejectedValue(new ProtocolNotFoundException('missing'));

    await expect(feature.execute('missing', {})).rejects.toBeInstanceOf(ProtocolNotFoundException);
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it.each([
    ProtocolStatus.CREATED,
    ProtocolStatus.CIC_CORRECTED,
    ProtocolStatus.CIEI_CORRECTED,
    ProtocolStatus.FINALIZED,
  ])(
    'throws ProtocolNotObservedException when the protocol is %s, without validating anything',
    async (status) => {
      (findProtocolByIdFeature.execute as jest.Mock).mockResolvedValue({ ...observedProtocol, status });

      await expect(feature.execute('p1', { titulo: 'X' })).rejects.toBeInstanceOf(ProtocolNotObservedException);
      expect(prisma.researcher.findUnique).not.toHaveBeenCalled();
      expect(prisma.$transaction).not.toHaveBeenCalled();
    },
  );

  it('accepts a patch while CIEI_OBSERVED, moving status to CIEI_CORRECTED', async () => {
    (findProtocolByIdFeature.execute as jest.Mock).mockResolvedValue({
      ...observedProtocol,
      status: ProtocolStatus.CIEI_OBSERVED,
    });
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await feature.execute('p1', { titulo: 'NUEVO TITULO' });

    expect(tx.protocol.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: ProtocolStatus.CIEI_OBSERVED },
      data: { status: ProtocolStatus.CIEI_CORRECTED },
    });
  });

  it('throws ProtocolNotObservedException on a concurrent status race, without calling update', async () => {
    mockValidReferences();
    (tx.protocol.updateMany as jest.Mock).mockResolvedValue({ count: 0 });

    await expect(feature.execute('p1', { titulo: 'X' })).rejects.toBeInstanceOf(ProtocolNotObservedException);
    expect(tx.protocol.update).not.toHaveBeenCalled();
  });

  it('re-evaluates business rules over the merged state (memos not applicable)', async () => {
    await expect(
      feature.execute('p1', { esInstitucional: false, lugarEjecucion: 'CLINICA SAN JUAN' }),
    ).rejects.toBeInstanceOf(ProtocoloMemosNoAplicablesException);
  });

  it('re-evaluates business rules over the merged state (duplicated researcher)', async () => {
    await expect(feature.execute('p1', { coinvestigadorIds: ['r1'] })).rejects.toBeInstanceOf(
      ProtocoloInvestigadorDuplicadoException,
    );
  });

  it('re-evaluates references over the merged state (facultad requires universidad)', async () => {
    mockValidReferences();
    (prisma.institution.findUnique as jest.Mock).mockResolvedValue({ id: 'i1', type: InstitutionType.HOSPITAL });

    await expect(feature.execute('p1', {})).rejects.toBeInstanceOf(ProtocoloFacultadRequiereUniversidadException);
  });

  it('throws ProtocolInvalidReferenceException when a patched reference does not exist', async () => {
    mockValidReferences();
    (prisma.modality.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('p1', { modalidadId: 'missing' })).rejects.toBeInstanceOf(
      ProtocolInvalidReferenceException,
    );
  });

  it('converts current Decimal-like fields correctly when re-validating HC rules', async () => {
    (findProtocolByIdFeature.execute as jest.Mock).mockResolvedValue({
      ...observedProtocol,
      requiereRevisionHc: true,
      montoHc: new Prisma.Decimal(50),
      tipoComprobanteHc: 'BOLETA',
      nroComprobanteHc: 'B001-123',
    });
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockResolvedValue({ id: 'p1' });

    await expect(feature.execute('p1', {})).resolves.toEqual({ id: 'p1' });
  });

  it('throws ProtocolNroExpedienteAlreadyExistsException on a duplicate nroExpediente', async () => {
    mockValidReferences();
    (tx.protocol.update as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'protocols_nro_expediente_key' } } } },
      }),
    );

    await expect(feature.execute('p1', { nroExpediente: '999/2026' })).rejects.toBeInstanceOf(
      ProtocolNroExpedienteAlreadyExistsException,
    );
  });

  it('rethrows errors that are not a unique constraint violation', async () => {
    mockValidReferences();
    const error = new Error('unexpected');
    (tx.protocol.update as jest.Mock).mockRejectedValue(error);

    await expect(feature.execute('p1', {})).rejects.toBe(error);
  });
});
