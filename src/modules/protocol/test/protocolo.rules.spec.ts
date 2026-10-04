import { applyProtocoloRules, ProtocoloRulesInput } from '../protocolo.rules';
import { ProtocoloRevisionHcIncompletaException } from '../exceptions/protocolo-revision-hc-incompleta.exception';
import { ProtocoloInvestigadorDuplicadoException } from '../exceptions/protocolo-investigador-duplicado.exception';
import { ProtocoloLugarEjecucionInconsistenteException } from '../exceptions/protocolo-lugar-ejecucion-inconsistente.exception';
import { ProtocoloMemosNoAplicablesException } from '../exceptions/protocolo-memos-no-aplicables.exception';
import { ProtocoloConstanciaEticaIncompletaException } from '../exceptions/protocolo-constancia-etica-incompleta.exception';
import { ProtocoloComprobanteInvalidoException } from '../exceptions/protocolo-comprobante-invalido.exception';

describe('applyProtocoloRules', () => {
  const baseInput: ProtocoloRulesInput = {
    convenioId: null,
    esEnmienda: false,
    pagoRevision: 150,
    tipoComprobante: 'BOLETA',
    comprobanteRevision: 'B001-123',
    tieneConstanciaEtica: false,
    idConstanciaEtica: null,
    fechaConstancia: null,
    certificadoBuenasPracticas: false,
    requiereRevisionHc: false,
    montoHc: null,
    tipoComprobanteHc: null,
    nroComprobanteHc: null,
    esInstitucional: true,
    destinoIds: [],
    investigadorPrincipalId: 'researcher-1',
    coinvestigadorIds: [],
    asesorIds: [],
    lugarEjecucion: 'HOSPITAL REGIONAL DE LORETO',
  };

  it('throws ProtocoloRevisionHcIncompletaException when requiereRevisionHc is true and a field is missing', () => {
    expect(() =>
      applyProtocoloRules({
        ...baseInput,
        requiereRevisionHc: true,
        montoHc: null,
        tipoComprobanteHc: 'BOLETA',
        nroComprobanteHc: 'B001-123',
      }),
    ).toThrow(ProtocoloRevisionHcIncompletaException);
  });

  it('keeps HC fields when requiereRevisionHc is true and all fields are present', () => {
    const result = applyProtocoloRules({
      ...baseInput,
      requiereRevisionHc: true,
      montoHc: 50,
      tipoComprobanteHc: 'BOLETA',
      nroComprobanteHc: 'B001-123',
    });

    expect(result.montoHc).toBe(50);
    expect(result.tipoComprobanteHc).toBe('BOLETA');
    expect(result.nroComprobanteHc).toBe('B001-123');
  });

  it('nulls HC fields when requiereRevisionHc is false even if values were passed', () => {
    const result = applyProtocoloRules({
      ...baseInput,
      requiereRevisionHc: false,
      montoHc: 50,
      tipoComprobanteHc: 'BOLETA',
      nroComprobanteHc: 'B001-123',
    });

    expect(result.montoHc).toBeNull();
    expect(result.tipoComprobanteHc).toBeNull();
    expect(result.nroComprobanteHc).toBeNull();
  });

  it('keeps destinoIds when esInstitucional is true', () => {
    const result = applyProtocoloRules({ ...baseInput, esInstitucional: true, destinoIds: ['destino-1'] });

    expect(result.destinoIds).toEqual(['destino-1']);
  });

  it('throws ProtocoloMemosNoAplicablesException when esInstitucional is false and destinos were passed', () => {
    expect(() =>
      applyProtocoloRules({
        ...baseInput,
        esInstitucional: false,
        destinoIds: ['destino-1'],
        lugarEjecucion: 'CLINICA SAN JUAN',
      }),
    ).toThrow(ProtocoloMemosNoAplicablesException);
  });

  it('does not throw when esInstitucional is false and destinoIds is empty', () => {
    expect(() =>
      applyProtocoloRules({
        ...baseInput,
        esInstitucional: false,
        destinoIds: [],
        lugarEjecucion: 'CLINICA SAN JUAN',
      }),
    ).not.toThrow();
  });

  it('throws ProtocoloInvestigadorDuplicadoException when the principal researcher is also a coinvestigador', () => {
    expect(() =>
      applyProtocoloRules({ ...baseInput, investigadorPrincipalId: 'researcher-1', coinvestigadorIds: ['researcher-1'] }),
    ).toThrow(ProtocoloInvestigadorDuplicadoException);
  });

  it('throws ProtocoloInvestigadorDuplicadoException when the principal researcher is also an asesor', () => {
    expect(() =>
      applyProtocoloRules({ ...baseInput, investigadorPrincipalId: 'researcher-1', asesorIds: ['researcher-1'] }),
    ).toThrow(ProtocoloInvestigadorDuplicadoException);
  });

  it('does not throw when coinvestigadores and asesores do not overlap with the principal researcher', () => {
    expect(() =>
      applyProtocoloRules({
        ...baseInput,
        investigadorPrincipalId: 'researcher-1',
        coinvestigadorIds: ['researcher-2'],
        asesorIds: ['researcher-3'],
      }),
    ).not.toThrow();
  });

  it('throws ProtocoloInvestigadorDuplicadoException when a coinvestigador is also an asesor', () => {
    expect(() =>
      applyProtocoloRules({
        ...baseInput,
        investigadorPrincipalId: 'researcher-1',
        coinvestigadorIds: ['researcher-2'],
        asesorIds: ['researcher-2'],
      }),
    ).toThrow(ProtocoloInvestigadorDuplicadoException);
  });

  it.each(['HOSPITAL REGIONAL DE LORETO', 'hospital regional', 'Hospital-Regional', 'hospitalRegional', 'Hospital_Regional'])(
    'throws ProtocoloLugarEjecucionInconsistenteException when esInstitucional is false and lugarEjecucion is a Hospital Regional variant (%s)',
    (lugarEjecucion) => {
      expect(() => applyProtocoloRules({ ...baseInput, esInstitucional: false, lugarEjecucion })).toThrow(
        ProtocoloLugarEjecucionInconsistenteException,
      );
    },
  );

  it('does not throw when esInstitucional is false and lugarEjecucion is a genuine external institution', () => {
    expect(() =>
      applyProtocoloRules({ ...baseInput, esInstitucional: false, lugarEjecucion: 'CLINICA SAN JUAN' }),
    ).not.toThrow();
  });

  it('does not throw when esInstitucional is true even if lugarEjecucion mentions Hospital Regional', () => {
    expect(() =>
      applyProtocoloRules({ ...baseInput, esInstitucional: true, lugarEjecucion: 'HOSPITAL REGIONAL DE LORETO' }),
    ).not.toThrow();
  });

  describe('pago de revisión', () => {
    it('keeps the payment when the protocol is not an amendment nor has an agreement', () => {
      const result = applyProtocoloRules(baseInput);

      expect(result.pagoRevision).toBe(150);
      expect(result.tipoComprobante).toBe('BOLETA');
      expect(result.comprobanteRevision).toBe('B001-123');
    });

    it('forces pagoRevision to 0 and nulls the receipt when convenioId is set', () => {
      const result = applyProtocoloRules({ ...baseInput, convenioId: 'a1' });

      expect(result.pagoRevision).toBe(0);
      expect(result.tipoComprobante).toBeNull();
      expect(result.comprobanteRevision).toBeNull();
    });

    it('forces pagoRevision to 0 and nulls the receipt when the protocol is an amendment', () => {
      const result = applyProtocoloRules({ ...baseInput, esEnmienda: true });

      expect(result.pagoRevision).toBe(0);
      expect(result.tipoComprobante).toBeNull();
      expect(result.comprobanteRevision).toBeNull();
    });
  });

  describe('documentación ética', () => {
    it('throws ProtocoloConstanciaEticaIncompletaException when tieneConstanciaEtica is true and the code is missing', () => {
      expect(() =>
        applyProtocoloRules({
          ...baseInput,
          tieneConstanciaEtica: true,
          idConstanciaEtica: null,
          fechaConstancia: new Date('2026-01-10'),
        }),
      ).toThrow(ProtocoloConstanciaEticaIncompletaException);
    });

    it('throws ProtocoloConstanciaEticaIncompletaException when tieneConstanciaEtica is true and the date is missing', () => {
      expect(() =>
        applyProtocoloRules({ ...baseInput, tieneConstanciaEtica: true, idConstanciaEtica: 'CE-1', fechaConstancia: null }),
      ).toThrow(ProtocoloConstanciaEticaIncompletaException);
    });

    it('keeps the constancia code and date when they are complete', () => {
      const fecha = new Date('2026-01-10');
      const result = applyProtocoloRules({
        ...baseInput,
        tieneConstanciaEtica: true,
        idConstanciaEtica: 'CE-1',
        fechaConstancia: fecha,
      });

      expect(result.idConstanciaEtica).toBe('CE-1');
      expect(result.fechaConstancia).toBe(fecha);
    });

    it('nulls the constancia code and date when tieneConstanciaEtica is false', () => {
      const result = applyProtocoloRules({
        ...baseInput,
        tieneConstanciaEtica: false,
        idConstanciaEtica: 'CE-1',
        fechaConstancia: new Date('2026-01-10'),
      });

      expect(result.idConstanciaEtica).toBeNull();
      expect(result.fechaConstancia).toBeNull();
    });

    it('resets the good practices certificate when the protocol does not require HC review', () => {
      const result = applyProtocoloRules({ ...baseInput, certificadoBuenasPracticas: true });

      expect(result.certificadoBuenasPracticas).toBe(false);
    });

    it('keeps the good practices certificate when the protocol requires HC review', () => {
      const result = applyProtocoloRules({
        ...baseInput,
        requiereRevisionHc: true,
        montoHc: 50,
        tipoComprobanteHc: 'BOLETA',
        nroComprobanteHc: 'B001-123',
        certificadoBuenasPracticas: true,
      });

      expect(result.certificadoBuenasPracticas).toBe(true);
    });
  });

  describe('formato de comprobantes (SUNAT)', () => {
    it.each([
      ['BOLETA', 'B001-1'],
      ['BOLETA', 'B001-00001234'],
      ['BOLETA', 'BA01-123'],
      ['FACTURA', 'F001-00001234'],
      ['FACTURA', 'FA01-9'],
    ])('accepts %s %s as the payment receipt', (tipo, numero) => {
      expect(() =>
        applyProtocoloRules({ ...baseInput, tipoComprobante: tipo, comprobanteRevision: numero }),
      ).not.toThrow();
    });

    it.each([
      ['BOLETA', 'F001-123'],
      ['FACTURA', 'B001-123'],
      ['BOLETA', 'B01-123'],
      ['BOLETA', 'B001123'],
      ['BOLETA', 'B001-123456789'],
      ['BOLETA', 'B001-ABC'],
      ['OTRO', 'B001-123'],
    ])('rejects %s %s as the payment receipt', (tipo, numero) => {
      expect(() =>
        applyProtocoloRules({ ...baseInput, tipoComprobante: tipo, comprobanteRevision: numero }),
      ).toThrow(ProtocoloComprobanteInvalidoException);
    });

    it('rejects a receipt number without its type and vice versa', () => {
      expect(() =>
        applyProtocoloRules({ ...baseInput, tipoComprobante: null, comprobanteRevision: 'B001-123' }),
      ).toThrow(ProtocoloComprobanteInvalidoException);
      expect(() =>
        applyProtocoloRules({ ...baseInput, tipoComprobante: 'BOLETA', comprobanteRevision: null }),
      ).toThrow(ProtocoloComprobanteInvalidoException);
    });

    it('does not validate the payment receipt when the protocol is exonerated', () => {
      expect(() =>
        applyProtocoloRules({ ...baseInput, esEnmienda: true, tipoComprobante: 'BOLETA', comprobanteRevision: 'xx' }),
      ).not.toThrow();
    });

    it('rejects an invalid HC receipt number', () => {
      expect(() =>
        applyProtocoloRules({
          ...baseInput,
          requiereRevisionHc: true,
          montoHc: 50,
          tipoComprobanteHc: 'FACTURA',
          nroComprobanteHc: 'B001-123',
        }),
      ).toThrow(ProtocoloComprobanteInvalidoException);
    });

    it('skips the receipt format checks when checkComprobantes is false', () => {
      expect(() =>
        applyProtocoloRules(
          { ...baseInput, tipoComprobante: 'BOLETA', comprobanteRevision: '123' },
          { checkComprobantes: false },
        ),
      ).not.toThrow();
    });
  });
});
