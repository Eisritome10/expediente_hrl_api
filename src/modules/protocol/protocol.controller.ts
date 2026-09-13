import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { CreateProtocolRequestDto } from './dtos/request/create-protocol.request.dto';
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
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear un protocolo' })
  @ApiCreatedResponse({ type: ProtocolResponseDto })
  async create(@Body() dto: CreateProtocolRequestDto): Promise<ProtocolResponseDto> {
    const protocol = await this.createProtocolFeature.execute({
      nroExpediente: dto.nroExpediente,
      fechaRecepcion: new Date(dto.fechaRecepcion),
      titulo: dto.titulo,
      disenoEstudio: dto.disenoEstudio,
      lugarEjecucion: dto.lugarEjecucion,
      esInstitucional: dto.esInstitucional ?? true,
      investigadorPrincipalId: dto.investigadorPrincipalId,
      coinvestigadorIds: dto.coinvestigadorIds ?? [],
      asesorIds: dto.asesorIds ?? [],
      institucionId: dto.institucionId ?? null,
      facultadId: dto.facultadId ?? null,
      destinoIds: dto.destinoIds ?? [],
      lineaHrlId: dto.lineaHrlId,
      lineaMeta2030Id: dto.lineaMeta2030Id,
      modalidadId: dto.modalidadId,
      propositoRevision: dto.propositoRevision,
      fechaRevision: dto.fechaRevision ? new Date(dto.fechaRevision) : null,
      tipoComprobante: dto.tipoComprobante ?? null,
      comprobanteRevision: dto.comprobanteRevision ?? null,
      pagoRevision: dto.pagoRevision ?? null,
      esEnmienda: dto.esEnmienda ?? false,
      esConvenio: dto.esConvenio ?? false,
      nombreConvenio: dto.nombreConvenio ?? null,
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
}
