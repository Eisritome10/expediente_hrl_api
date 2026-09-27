import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { UseAuth } from '../auth/decorators/use-auth.decorator';
import { ApiPaginatedResponse } from '../../common/swagger/api-paginated-response.decorator';
import { PaginatedResultResponseDto } from '../../common/dtos/response/paginated-result.response.dto';
import { CreateProtocolFeature } from './features/create-protocol.feature';
import { ListProtocolsFeature } from './features/list-protocols.feature';
import { FindProtocolByIdFeature } from './features/find-protocol-by-id.feature';
import { UpdateProtocolFeature, UpdateProtocolInput } from './features/update-protocol.feature';
import { CreateProtocolRequestDto } from './dtos/request/create-protocol.request.dto';
import { UpdateProtocolRequestDto } from './dtos/request/update-protocol.request.dto';
import { ListProtocolsQueryDto } from './dtos/request/list-protocols.query.dto';
import { ProtocolResponseDto } from './dtos/response/protocol.response.dto';

@ApiTags('protocols')
@ApiBearerAuth()
@Controller('protocols')
@UseAuth(UserRole.ADMIN)
export class ProtocolController {
  constructor(
    private readonly createProtocolFeature: CreateProtocolFeature,
    private readonly listProtocolsFeature: ListProtocolsFeature,
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
      propositoRevision: dto.propositoRevision,
      fechaRevision: dto.fechaRevision ? new Date(dto.fechaRevision) : null,
      tipoComprobante: dto.tipoComprobante ?? null,
      comprobanteRevision: dto.comprobanteRevision ?? null,
      pagoRevision: dto.pagoRevision ?? null,
      esEnmienda: dto.esEnmienda ?? false,
      convenioId: dto.convenioId ?? null,
      requiereRevisionHc: dto.requiereRevisionHc ?? false,
      montoHc: dto.montoHc ?? null,
      tipoComprobanteHc: dto.tipoComprobanteHc ?? null,
      nroComprobanteHc: dto.nroComprobanteHc ?? null,
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
      propositoRevision: dto.propositoRevision,
      fechaRevision: dto.fechaRevision !== undefined ? (dto.fechaRevision ? new Date(dto.fechaRevision) : null) : undefined,
      tipoComprobante: dto.tipoComprobante,
      comprobanteRevision: dto.comprobanteRevision,
      pagoRevision: dto.pagoRevision,
      esEnmienda: dto.esEnmienda,
      requiereRevisionHc: dto.requiereRevisionHc,
      montoHc: dto.montoHc,
      tipoComprobanteHc: dto.tipoComprobanteHc,
      nroComprobanteHc: dto.nroComprobanteHc,
      certificadoBuenasPracticas: dto.certificadoBuenasPracticas,
    };
  }
}
