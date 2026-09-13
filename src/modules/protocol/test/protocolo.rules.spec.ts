import { applyProtocoloRules, ProtocoloRulesInput } from '../protocolo.rules';
import { ProtocoloConvenioSinNombreException } from '../exceptions/protocolo-convenio-sin-nombre.exception';
import { ProtocoloRevisionHcIncompletaException } from '../exceptions/protocolo-revision-hc-incompleta.exception';
import { ProtocoloInvestigadorDuplicadoException } from '../exceptions/protocolo-investigador-duplicado.exception';
import { ProtocoloLugarEjecucionInconsistenteException } from '../exceptions/protocolo-lugar-ejecucion-inconsistente.exception';
import { ProtocoloMemosNoAplicablesException } from '../exceptions/protocolo-memos-no-aplicables.exception';

describe('applyProtocoloRules', () => {
  const baseInput: ProtocoloRulesInput = {
    esConvenio: false,
    nombreConvenio: null,
    esEnmienda: false,
    pagoRevision: 150,
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

  it('keeps pagoRevision as-is when neither convenio nor enmienda apply', () => {
    const result = applyProtocoloRules(baseInput);

    expect(result.pagoRevision).toBe(150);
  });

  it('throws ProtocoloConvenioSinNombreException when esConvenio is true without nombreConvenio', () => {
    expect(() => applyProtocoloRules({ ...baseInput, esConvenio: true, nombreConvenio: null })).toThrow(
      ProtocoloConvenioSinNombreException,
    );
  });

  it('forces pagoRevision to 0 when esConvenio is true', () => {
    const result = applyProtocoloRules({
      ...baseInput,
      esConvenio: true,
      nombreConvenio: 'Universidad X',
      pagoRevision: 150,
    });

    expect(result.pagoRevision).toBe(0);
    expect(result.nombreConvenio).toBe('Universidad X');
  });

  it('forces pagoRevision to 0 when esEnmienda is true', () => {
    const result = applyProtocoloRules({ ...baseInput, esEnmienda: true, pagoRevision: 150 });

    expect(result.pagoRevision).toBe(0);
  });

  it('clears nombreConvenio when esConvenio is false', () => {
    const result = applyProtocoloRules({ ...baseInput, esConvenio: false, nombreConvenio: 'Should be ignored' });

    expect(result.nombreConvenio).toBeNull();
  });

  it('throws ProtocoloRevisionHcIncompletaException when requiereRevisionHc is true and a field is missing', () => {
    expect(() =>
      applyProtocoloRules({
        ...baseInput,
        requiereRevisionHc: true,
        montoHc: null,
        tipoComprobanteHc: 'BOLETA',
        nroComprobanteHc: '001',
      }),
    ).toThrow(ProtocoloRevisionHcIncompletaException);
  });

  it('keeps HC fields when requiereRevisionHc is true and all fields are present', () => {
    const result = applyProtocoloRules({
      ...baseInput,
      requiereRevisionHc: true,
      montoHc: 50,
      tipoComprobanteHc: 'BOLETA',
      nroComprobanteHc: '001',
    });

    expect(result.montoHc).toBe(50);
    expect(result.tipoComprobanteHc).toBe('BOLETA');
    expect(result.nroComprobanteHc).toBe('001');
  });

  it('nulls HC fields when requiereRevisionHc is false even if values were passed', () => {
    const result = applyProtocoloRules({
      ...baseInput,
      requiereRevisionHc: false,
      montoHc: 50,
      tipoComprobanteHc: 'BOLETA',
      nroComprobanteHc: '001',
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
});
