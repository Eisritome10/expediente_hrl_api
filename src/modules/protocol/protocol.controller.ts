import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UseAuth } from '../auth/decorators/use-auth.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthCurrentUser } from '../../common/interfaces/auth-current-user.interface';
import { PaginateQueryDto } from '../../common/dtos/request/paginate-query.request.dto';
import { ApiPaginatedResponse } from '../../common/swagger/api-paginated-response.decorator';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';
import { CreateProtocolFeature } from './features/create-protocol.feature';
import { ListProtocolsFeature } from './features/list-protocols.feature';
import { ListResearcherProtocolsFeature } from './features/list-researcher-protocols.feature';
import { FindResearcherProtocolByIdFeature } from './features/find-researcher-protocol-by-id.feature';
import { FindProtocolByIdFeature } from './features/find-protocol-by-id.feature';
import { UpdateProtocolFeature, UpdateProtocolInput } from './features/update-protocol.feature';
import { CreateProtocolRequestDto } from './dtos/request/create-protocol.request.dto';
import { UpdateProtocolRequestDto } from './dtos/request/update-protocol.request.dto';
import { ListProtocolsQueryDto } from './dtos/request/list-protocols.query.dto';
import { ProtocolResponseDto } from './dtos/response/protocol.response.dto';
import { ProtocolSummaryResponseDto } from './dtos/response/protocol-summary.response.dto';
import { ResearcherProtocolDetailResponseDto } from './dtos/response/researcher-protocol-detail.response.dto';

@ApiTags('protocols')
@ApiBearerAuth()
@Controller('protocols')
@UseAuth(UserRole.ADMIN)
export class ProtocolController {
  constructor(
    private readonly createProtocolFeature: CreateProtocolFeature,
    private readonly listProtocolsFeature: ListProtocolsFeature,
    private readonly listResearcherProtocolsFeature: ListResearcherProtocolsFeature,
    private readonly findResearcherProtocolByIdFeature: FindResearcherProtocolByIdFeature,
    private readonly findProtocolByIdFeature: FindProtocolByIdFeature,
    private readonly updateProtocolFeature: UpdateProtocolFeature,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un protocolo' })
  @ApiCreatedResponse({ type: ProtocolResponseDto })
  async create(@Body() dto: CreateProtocolRequestDto): Promise<ProtocolResponseDto> {
    const protocol = await this.createProtocolFeature.execute({
      nroExpediente: dto.nroExpediente,
      fechaRecepcion: new Date(dto.fechaRecepcion),
      titulo: dto.titulo,
      lugarEjecucion: dto.lugarEjecucion,
      esInstitucional: dto.esInstitucional ?? true,
      investigadorPrincipalId: dto.investigadorPrincipalId,
      coinvestigadorIds: dto.coinvestigadorIds ?? [],
      asesorIds: dto.asesorIds ?? [],
      institucionId: dto.institucionId ?? null,
      facultadId: dto.facultadId ?? null,
      destinoIds: dto.destinoIds ?? [],
      studyDesignIds: dto.studyDesignIds ?? [],
      lineaHrlId: dto.lineaHrlId,
      lineaMeta2030Id: dto.lineaMeta2030Id,
      modalidadId: dto.modalidadId,
      convenioId: dto.convenioId ?? null,
      pagoRevision: dto.pagoRevision ?? null,
      tipoComprobante: dto.tipoComprobante ?? null,
      comprobanteRevision: dto.comprobanteRevision ?? null,
      protocoloOriginalId: dto.protocoloOriginalId ?? null,
      requiereRevisionHc: dto.requiereRevisionHc ?? false,
      montoHc: dto.montoHc ?? null,
      tipoComprobanteHc: dto.tipoComprobanteHc ?? null,
      nroComprobanteHc: dto.nroComprobanteHc ?? null,
      tieneConstanciaEtica: dto.tieneConstanciaEtica ?? false,
      idConstanciaEtica: dto.idConstanciaEtica ?? null,
      fechaConstancia: dto.fechaConstancia ? new Date(dto.fechaConstancia) : null,
      consentimientoInformado: dto.consentimientoInformado ?? false,
      departamentoDirigidoPermiso: dto.departamentoDirigidoPermiso ?? null,
      certificadoBuenasPracticas: dto.certificadoBuenasPracticas ?? false,
    });

    return ProtocolResponseDto.from(protocol);
  }

  @Get()
  @ApiOperation({ summary: 'Listar protocolos' })
  @ApiPaginatedResponse(ProtocolResponseDto)
  async list(@Query() query: ListProtocolsQueryDto): Promise<PaginatedResultResponseDto<ProtocolResponseDto>> {
    const { data, page, limit, total } = await this.listProtocolsFeature.execute(query.page, query.limit, {
      nroExpediente: query.nroExpediente,
      investigadorPrincipalId: query.investigadorPrincipalId,
      fechaRecepcionDesde: query.fechaRecepcionDesde ? new Date(query.fechaRecepcionDesde) : undefined,
      fechaRecepcionHasta: query.fechaRecepcionHasta ? new Date(query.fechaRecepcionHasta) : undefined,
      status: query.status,
    });

    return PaginatedResultResponseDto.from(data.map(ProtocolResponseDto.from), page, limit, total);
  }

  // Debe declararse antes que @Get(':id'), o "mine" se interpretaría como un id.
  // El rol a nivel de método reemplaza al ADMIN de la clase (RolesGuard usa getAllAndOverride).
  @Get('mine')
  @UseAuth(UserRole.RESEARCHER)
  @ApiOperation({ summary: 'Listar mis protocolos (investigador)' })
  @ApiPaginatedResponse(ProtocolSummaryResponseDto)
  @ApiForbiddenResponse({ description: 'Solo disponible para el rol investigador con una cuenta vinculada' })
  async listMine(
    @CurrentUser() currentUser: AuthCurrentUser,
    @Query() query: PaginateQueryDto,
  ): Promise<PaginatedResultResponseDto<ProtocolSummaryResponseDto>> {
    const { data, page, limit, total } = await this.listResearcherProtocolsFeature.execute(
      currentUser.id,
      query.page,
      query.limit,
    );

    return PaginatedResultResponseDto.from(data.map(ProtocolSummaryResponseDto.from), page, limit, total);
  }

  // Debe declararse antes que @Get(':id'), o "mine" se interpretaría como un id.
  // Solo devuelve protocolos donde el investigador autenticado participa; sin montos ni revisor.
  @Get('mine/:id')
  @UseAuth(UserRole.RESEARCHER)
  @ApiOperation({ summary: 'Obtener el detalle de uno de mis protocolos (investigador)' })
  @ApiParam({ name: 'id', description: 'Id del protocolo' })
  @ApiOkResponse({ type: ResearcherProtocolDetailResponseDto })
  @ApiForbiddenResponse({ description: 'Solo disponible para el rol investigador con una cuenta vinculada' })
  @ApiNotFoundResponse({ description: 'El protocolo no existe o no pertenece al investigador' })
  async findMineById(
    @CurrentUser() currentUser: AuthCurrentUser,
    @Param('id') id: string,
  ): Promise<ResearcherProtocolDetailResponseDto> {
    const protocol = await this.findResearcherProtocolByIdFeature.execute(currentUser.id, id);

    return ResearcherProtocolDetailResponseDto.from(protocol);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un protocolo por id' })
  @ApiParam({ name: 'id', description: 'Id del protocolo' })
  @ApiOkResponse({ type: ProtocolResponseDto })
  @ApiNotFoundResponse({ description: 'El protocolo no existe' })
  async findById(@Param('id') id: string): Promise<ProtocolResponseDto> {
    const protocol = await this.findProtocolByIdFeature.execute(id);

    return ProtocolResponseDto.from(protocol);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Corregir un protocolo observado',
    description:
      'Solo permitido si el protocolo está OBSERVADO. Los campos omitidos se conservan; null en un campo opcional lo limpia; un array reemplaza la relación completa. Al guardar, el estado pasa a CORREGIDO.',
  })
  @ApiParam({ name: 'id', description: 'Id del protocolo' })
  @ApiOkResponse({ type: ProtocolResponseDto })
  @ApiNotFoundResponse({ description: 'El protocolo no existe' })
  @ApiConflictResponse({ description: 'El protocolo no está en estado OBSERVADO o el número de expediente ya existe' })
  async update(@Param('id') id: string, @Body() dto: UpdateProtocolRequestDto): Promise<ProtocolResponseDto> {
    const protocol = await this.updateProtocolFeature.execute(id, this.toUpdateInput(dto));

    return ProtocolResponseDto.from(protocol);
  }

  private toUpdateInput(dto: UpdateProtocolRequestDto): UpdateProtocolInput {
    return {
      correctionComment: dto.correctionComment?.trim() || undefined,
      nroExpediente: dto.nroExpediente,
      fechaRecepcion: dto.fechaRecepcion !== undefined ? new Date(dto.fechaRecepcion) : undefined,
      titulo: dto.titulo,
      lugarEjecucion: dto.lugarEjecucion,
      esInstitucional: dto.esInstitucional,
      investigadorPrincipalId: dto.investigadorPrincipalId,
      coinvestigadorIds: dto.coinvestigadorIds,
      asesorIds: dto.asesorIds,
      institucionId: dto.institucionId,
      facultadId: dto.facultadId,
      convenioId: dto.convenioId,
      destinoIds: dto.destinoIds,
      studyDesignIds: dto.studyDesignIds,
      lineaHrlId: dto.lineaHrlId,
      lineaMeta2030Id: dto.lineaMeta2030Id,
      modalidadId: dto.modalidadId,
      pagoRevision: dto.pagoRevision,
      tipoComprobante: dto.tipoComprobante,
      comprobanteRevision: dto.comprobanteRevision,
      tieneConstanciaEtica: dto.tieneConstanciaEtica,
      idConstanciaEtica: dto.idConstanciaEtica,
      fechaConstancia:
        dto.fechaConstancia !== undefined ? (dto.fechaConstancia ? new Date(dto.fechaConstancia) : null) : undefined,
      consentimientoInformado: dto.consentimientoInformado,
      departamentoDirigidoPermiso: dto.departamentoDirigidoPermiso,
      certificadoBuenasPracticas: dto.certificadoBuenasPracticas,
      requiereRevisionHc: dto.requiereRevisionHc,
      montoHc: dto.montoHc,
      tipoComprobanteHc: dto.tipoComprobanteHc,
      nroComprobanteHc: dto.nroComprobanteHc,
    };
  }
}
