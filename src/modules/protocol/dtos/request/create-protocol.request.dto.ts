import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UpperCase } from '../../../../common/decorators/upper-case.decorator';

export class CreateProtocolRequestDto {
  @ApiProperty({ description: 'Número de expediente (único)', example: '542/2026' })
  @IsString()
  @Length(1, 255)
  @UpperCase()
  nroExpediente: string;

  @ApiProperty({ description: 'Fecha de recepción', example: '2026-01-15' })
  @IsDateString()
  fechaRecepcion: string;

  @ApiProperty({ description: 'Título del proyecto', example: 'Estudio sobre...' })
  @IsString()
  @Length(1, 500)
  @UpperCase()
  titulo: string;

  @ApiProperty({ description: 'Lugar de ejecución', example: 'Hospital Regional de Loreto' })
  @IsString()
  @Length(1, 255)
  @UpperCase()
  lugarEjecucion: string;

  @ApiPropertyOptional({ description: '¿Es institucional?', default: true })
  @IsOptional()
  @IsBoolean()
  esInstitucional?: boolean;

  @ApiProperty({ description: 'Id del investigador principal' })
  @IsUUID()
  investigadorPrincipalId: string;

  @ApiPropertyOptional({ description: 'Ids de coinvestigadores', type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  coinvestigadorIds?: string[];

  @ApiPropertyOptional({ description: 'Ids de asesores', type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  asesorIds?: string[];

  @ApiPropertyOptional({ description: 'Id de la institución' })
  @IsOptional()
  @IsUUID()
  institucionId?: string;

  @ApiPropertyOptional({ description: 'Id de la facultad' })
  @IsOptional()
  @IsUUID()
  facultadId?: string;

  @ApiPropertyOptional({ description: 'Ids de destinos (memo)', type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  destinoIds?: string[];

  @ApiPropertyOptional({ description: 'Ids de diseños de estudio', type: [String], default: [] })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  studyDesignIds?: string[];

  @ApiProperty({ description: 'Id de la línea de investigación HRL' })
  @IsUUID()
  lineaHrlId: string;

  @ApiProperty({ description: 'Id de la línea de investigación Meta 2030' })
  @IsUUID()
  lineaMeta2030Id: string;

  @ApiProperty({ description: 'Id de la modalidad' })
  @IsUUID()
  modalidadId: string;

  @ApiProperty({ description: 'Propósito de la revisión', example: 'Revisión inicial' })
  @IsString()
  @Length(1, 255)
  @UpperCase()
  propositoRevision: string;

  @ApiPropertyOptional({ description: 'Fecha de revisión', example: '2026-01-20' })
  @IsOptional()
  @IsDateString()
  fechaRevision?: string;

  @ApiPropertyOptional({ description: 'Tipo de comprobante' })
  @IsOptional()
  @IsString()
  @UpperCase()
  tipoComprobante?: string;

  @ApiPropertyOptional({ description: 'N° de comprobante de revisión' })
  @IsOptional()
  @IsString()
  @UpperCase()
  comprobanteRevision?: string;

  @ApiPropertyOptional({ description: 'Pago de revisión', example: 150.0 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pagoRevision?: number;

  @ApiPropertyOptional({ description: '¿Es enmienda?', default: false })
  @IsOptional()
  @IsBoolean()
  esEnmienda?: boolean;

  @ApiPropertyOptional({ description: '¿Es convenio?', default: false })
  @IsOptional()
  @IsBoolean()
  esConvenio?: boolean;

  @ApiPropertyOptional({ description: 'Nombre de la institución del convenio (requerido si esConvenio es true)' })
  @IsOptional()
  @IsString()
  @UpperCase()
  nombreConvenio?: string;

  @ApiPropertyOptional({ description: '¿Requiere revisión de historia clínica?', default: false })
  @IsOptional()
  @IsBoolean()
  requiereRevisionHc?: boolean;

  @ApiPropertyOptional({ description: 'Monto de revisión de historia clínica' })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  montoHc?: number;

  @ApiPropertyOptional({ description: 'Tipo de comprobante de historia clínica' })
  @IsOptional()
  @IsString()
  @UpperCase()
  tipoComprobanteHc?: string;

  @ApiPropertyOptional({ description: 'N° de comprobante de historia clínica' })
  @IsOptional()
  @IsString()
  @UpperCase()
  nroComprobanteHc?: string;

  @ApiPropertyOptional({ description: '¿Cuenta con certificado de buenas prácticas?', default: false })
  @IsOptional()
  @IsBoolean()
  certificadoBuenasPracticas?: boolean;
}
