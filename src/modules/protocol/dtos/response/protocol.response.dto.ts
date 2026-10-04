import { ProtocolStatus, Researcher, RiskLevel } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProtocolWithRelations } from '../../protocol.include';

export class ProtocolRelatedResearcherResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly dni: string;
  @ApiProperty() readonly firstName: string;
  @ApiProperty() readonly lastName: string;

  private constructor(id: string, dni: string, firstName: string, lastName: string) {
    this.id = id;
    this.dni = dni;
    this.firstName = firstName;
    this.lastName = lastName;
  }

  static from(researcher: Researcher): ProtocolRelatedResearcherResponseDto {
    return new ProtocolRelatedResearcherResponseDto(
      researcher.id,
      researcher.dni,
      researcher.firstName,
      researcher.lastName,
    );
  }
}

class ProtocolRelatedEntityResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly name: string;

  private constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  static of(id: string, name: string): ProtocolRelatedEntityResponseDto {
    return new ProtocolRelatedEntityResponseDto(id, name);
  }
}

export class ProtocolCorrectionResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly comment: string;
  @ApiProperty() readonly createdAt: Date;

  private constructor(id: string, comment: string, createdAt: Date) {
    this.id = id;
    this.comment = comment;
    this.createdAt = createdAt;
  }

  static of(id: string, comment: string, createdAt: Date): ProtocolCorrectionResponseDto {
    return new ProtocolCorrectionResponseDto(id, comment, createdAt);
  }
}

class ProtocolOriginalResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly nroExpediente: string;

  private constructor(id: string, nroExpediente: string) {
    this.id = id;
    this.nroExpediente = nroExpediente;
  }

  static of(id: string, nroExpediente: string): ProtocolOriginalResponseDto {
    return new ProtocolOriginalResponseDto(id, nroExpediente);
  }
}

class ProtocolRelatedModalityResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty() readonly name: string;
  @ApiProperty() readonly fee: number;

  private constructor(id: string, name: string, fee: number) {
    this.id = id;
    this.name = name;
    this.fee = fee;
  }

  static of(id: string, name: string, fee: number): ProtocolRelatedModalityResponseDto {
    return new ProtocolRelatedModalityResponseDto(id, name, fee);
  }
}

export class ProtocolResponseDto {
  @ApiProperty() readonly id: string;
  @ApiProperty({ enum: ProtocolStatus, description: 'Estado del protocolo: CREATED (creado), CIC_OBSERVED (observado por CIC), CIC_CORRECTED (corregido para CIC), CIEI_OBSERVED (observado por CIEI), CIEI_CORRECTED (corregido para CIEI), FINALIZED (finalizado)' })
  readonly status: ProtocolStatus;
  @ApiProperty() readonly nroExpediente: string;
  @ApiProperty() readonly fechaRecepcion: Date;
  @ApiProperty() readonly titulo: string;
  @ApiProperty() readonly lugarEjecucion: string;
  @ApiProperty() readonly esInstitucional: boolean;

  @ApiProperty({ type: ProtocolRelatedResearcherResponseDto })
  readonly investigadorPrincipal: ProtocolRelatedResearcherResponseDto;

  @ApiProperty({ type: ProtocolRelatedResearcherResponseDto, isArray: true })
  readonly coinvestigadores: ProtocolRelatedResearcherResponseDto[];

  @ApiProperty({ type: ProtocolRelatedResearcherResponseDto, isArray: true })
  readonly asesores: ProtocolRelatedResearcherResponseDto[];

  @ApiPropertyOptional({ type: ProtocolRelatedEntityResponseDto, nullable: true })
  readonly institucion: ProtocolRelatedEntityResponseDto | null;

  @ApiPropertyOptional({ type: ProtocolRelatedEntityResponseDto, nullable: true })
  readonly facultad: ProtocolRelatedEntityResponseDto | null;

  @ApiProperty({ type: ProtocolRelatedEntityResponseDto, isArray: true })
  readonly destinos: ProtocolRelatedEntityResponseDto[];

  @ApiProperty({ type: ProtocolRelatedEntityResponseDto, isArray: true })
  readonly disenosEstudio: ProtocolRelatedEntityResponseDto[];

  @ApiProperty({ type: ProtocolRelatedEntityResponseDto })
  readonly lineaHrl: ProtocolRelatedEntityResponseDto;

  @ApiProperty({ type: ProtocolRelatedEntityResponseDto })
  readonly lineaMeta2030: ProtocolRelatedEntityResponseDto;

  @ApiProperty({ type: ProtocolRelatedModalityResponseDto })
  readonly modalidad: ProtocolRelatedModalityResponseDto;

  @ApiPropertyOptional({ nullable: true, description: 'Dato histórico: ya no se pide al registrar' })
  readonly propositoRevision: string | null;
  @ApiPropertyOptional({ nullable: true }) readonly fechaRevision: Date | null;
  @ApiPropertyOptional({ nullable: true }) readonly tipoComprobante: string | null;
  @ApiPropertyOptional({ nullable: true }) readonly comprobanteRevision: string | null;
  @ApiPropertyOptional({ nullable: true }) readonly pagoRevision: number | null;

  @ApiProperty() readonly esEnmienda: boolean;
  @ApiPropertyOptional({ nullable: true }) readonly protocoloOriginalId: string | null;
  @ApiPropertyOptional({ type: ProtocolOriginalResponseDto, nullable: true })
  readonly protocoloOriginal: ProtocolOriginalResponseDto | null;
  @ApiProperty() readonly esConvenio: boolean;
  @ApiPropertyOptional({ type: ProtocolRelatedEntityResponseDto, nullable: true })
  readonly convenio: ProtocolRelatedEntityResponseDto | null;

  @ApiProperty() readonly requiereRevisionHc: boolean;
  @ApiPropertyOptional({ nullable: true }) readonly montoHc: number | null;
  @ApiPropertyOptional({ nullable: true }) readonly tipoComprobanteHc: string | null;
  @ApiPropertyOptional({ nullable: true }) readonly nroComprobanteHc: string | null;

  @ApiProperty() readonly certificadoBuenasPracticas: boolean;

  @ApiProperty() readonly tieneConstanciaEtica: boolean;
  @ApiPropertyOptional({ nullable: true }) readonly idConstanciaEtica: string | null;
  @ApiPropertyOptional({ nullable: true }) readonly fechaConstancia: Date | null;
  @ApiPropertyOptional({ enum: RiskLevel, nullable: true }) readonly catalogadoRiesgo: RiskLevel | null;
  @ApiProperty() readonly consentimientoInformado: boolean;
  @ApiPropertyOptional({ nullable: true }) readonly departamentoDirigidoPermiso: string | null;

  @ApiProperty({ type: [ProtocolCorrectionResponseDto], description: 'Comentarios de corrección, del más reciente al más antiguo' })
  readonly corrections: ProtocolCorrectionResponseDto[];

  @ApiProperty() readonly createdAt: Date;
  @ApiProperty() readonly updatedAt: Date;

  private constructor(
    id: string,
    status: ProtocolStatus,
    nroExpediente: string,
    fechaRecepcion: Date,
    titulo: string,
    lugarEjecucion: string,
    esInstitucional: boolean,
    investigadorPrincipal: ProtocolRelatedResearcherResponseDto,
    coinvestigadores: ProtocolRelatedResearcherResponseDto[],
    asesores: ProtocolRelatedResearcherResponseDto[],
    institucion: ProtocolRelatedEntityResponseDto | null,
    facultad: ProtocolRelatedEntityResponseDto | null,
    destinos: ProtocolRelatedEntityResponseDto[],
    disenosEstudio: ProtocolRelatedEntityResponseDto[],
    lineaHrl: ProtocolRelatedEntityResponseDto,
    lineaMeta2030: ProtocolRelatedEntityResponseDto,
    modalidad: ProtocolRelatedModalityResponseDto,
    propositoRevision: string | null,
    fechaRevision: Date | null,
    tipoComprobante: string | null,
    comprobanteRevision: string | null,
    pagoRevision: number | null,
    esEnmienda: boolean,
    protocoloOriginalId: string | null,
    protocoloOriginal: ProtocolOriginalResponseDto | null,
    esConvenio: boolean,
    convenio: ProtocolRelatedEntityResponseDto | null,
    requiereRevisionHc: boolean,
    montoHc: number | null,
    tipoComprobanteHc: string | null,
    nroComprobanteHc: string | null,
    certificadoBuenasPracticas: boolean,
    tieneConstanciaEtica: boolean,
    idConstanciaEtica: string | null,
    fechaConstancia: Date | null,
    catalogadoRiesgo: RiskLevel | null,
    consentimientoInformado: boolean,
    departamentoDirigidoPermiso: string | null,
    corrections: ProtocolCorrectionResponseDto[],
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.status = status;
    this.nroExpediente = nroExpediente;
    this.fechaRecepcion = fechaRecepcion;
    this.titulo = titulo;
    this.lugarEjecucion = lugarEjecucion;
    this.esInstitucional = esInstitucional;
    this.investigadorPrincipal = investigadorPrincipal;
    this.coinvestigadores = coinvestigadores;
    this.asesores = asesores;
    this.institucion = institucion;
    this.facultad = facultad;
    this.destinos = destinos;
    this.disenosEstudio = disenosEstudio;
    this.lineaHrl = lineaHrl;
    this.lineaMeta2030 = lineaMeta2030;
    this.modalidad = modalidad;
    this.propositoRevision = propositoRevision;
    this.fechaRevision = fechaRevision;
    this.tipoComprobante = tipoComprobante;
    this.comprobanteRevision = comprobanteRevision;
    this.pagoRevision = pagoRevision;
    this.esEnmienda = esEnmienda;
    this.protocoloOriginalId = protocoloOriginalId;
    this.protocoloOriginal = protocoloOriginal;
    this.esConvenio = esConvenio;
    this.convenio = convenio;
    this.requiereRevisionHc = requiereRevisionHc;
    this.montoHc = montoHc;
    this.tipoComprobanteHc = tipoComprobanteHc;
    this.nroComprobanteHc = nroComprobanteHc;
    this.certificadoBuenasPracticas = certificadoBuenasPracticas;
    this.tieneConstanciaEtica = tieneConstanciaEtica;
    this.idConstanciaEtica = idConstanciaEtica;
    this.fechaConstancia = fechaConstancia;
    this.catalogadoRiesgo = catalogadoRiesgo;
    this.consentimientoInformado = consentimientoInformado;
    this.departamentoDirigidoPermiso = departamentoDirigidoPermiso;
    this.corrections = corrections;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(protocol: ProtocolWithRelations): ProtocolResponseDto {
    return new ProtocolResponseDto(
      protocol.id,
      protocol.status,
      protocol.nroExpediente,
      protocol.fechaRecepcion,
      protocol.titulo,
      protocol.lugarEjecucion,
      protocol.esInstitucional,
      ProtocolRelatedResearcherResponseDto.from(protocol.investigadorPrincipal),
      protocol.coinvestigadores.map((c) => ProtocolRelatedResearcherResponseDto.from(c.researcher)),
      protocol.asesores.map((a) => ProtocolRelatedResearcherResponseDto.from(a.researcher)),
      protocol.institucion ? ProtocolRelatedEntityResponseDto.of(protocol.institucion.id, protocol.institucion.name) : null,
      protocol.facultad ? ProtocolRelatedEntityResponseDto.of(protocol.facultad.id, protocol.facultad.name) : null,
      protocol.destinos.map((d) => ProtocolRelatedEntityResponseDto.of(d.destination.id, d.destination.description)),
      protocol.disenosEstudio.map((d) => ProtocolRelatedEntityResponseDto.of(d.studyDesign.id, d.studyDesign.name)),
      ProtocolRelatedEntityResponseDto.of(protocol.lineaHrl.id, protocol.lineaHrl.name),
      ProtocolRelatedEntityResponseDto.of(protocol.lineaMeta2030.id, protocol.lineaMeta2030.name),
      ProtocolRelatedModalityResponseDto.of(protocol.modalidad.id, protocol.modalidad.name, Number(protocol.modalidad.fee)),
      protocol.propositoRevision,
      protocol.fechaRevision,
      protocol.tipoComprobante,
      protocol.comprobanteRevision,
      protocol.pagoRevision !== null ? Number(protocol.pagoRevision) : null,
      protocol.esEnmienda,
      protocol.protocoloOriginalId,
      protocol.protocoloOriginal
        ? ProtocolOriginalResponseDto.of(protocol.protocoloOriginal.id, protocol.protocoloOriginal.nroExpediente)
        : null,
      protocol.convenioId !== null,
      protocol.convenio ? ProtocolRelatedEntityResponseDto.of(protocol.convenio.id, protocol.convenio.name) : null,
      protocol.requiereRevisionHc,
      protocol.montoHc !== null ? Number(protocol.montoHc) : null,
      protocol.tipoComprobanteHc,
      protocol.nroComprobanteHc,
      protocol.certificadoBuenasPracticas,
      protocol.tieneConstanciaEtica,
      protocol.idConstanciaEtica,
      protocol.fechaConstancia,
      protocol.catalogadoRiesgo,
      protocol.consentimientoInformado,
      protocol.departamentoDirigidoPermiso,
      protocol.corrections.map((correction) =>
        ProtocolCorrectionResponseDto.of(correction.id, correction.comment, correction.createdAt),
      ),
      protocol.createdAt,
      protocol.updatedAt,
    );
  }
}
