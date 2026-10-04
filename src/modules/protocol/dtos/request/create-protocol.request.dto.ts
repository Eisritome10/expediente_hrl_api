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
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UpperCase } from '../../../../common/decorators/upper-case.decorator';

export class CreateProtocolRequestDto {
  @ApiProperty({
    description: 'Número de expediente (único). Solo números: hasta 4 dígitos, una barra y hasta 6 dígitos',
    example: '1234/123456',
  })
  @IsString()
  @Matches(/^\d{1,4}\/\d{1,6}$/, {
    message: 'nroExpediente debe tener el formato 1234/123456 (solo números)',
  })
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

  @ApiPropertyOptional({ description: 'Id del convenio' })
  @IsOptional()
  @IsUUID()
  convenioId?: string;

  @ApiPropertyOptional({ description: 'Id del protocolo original finalizado (marca este registro como enmienda)' })
  @IsOptional()
  @IsUUID()
  protocoloOriginalId?: string;

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

  @ApiPropertyOptional({ description: 'Tipo de comprobante del pago de revisión', example: 'BOLETA' })
  @IsOptional()
  @IsString()
  @UpperCase()
  tipoComprobante?: string;

  @ApiPropertyOptional({ description: 'N° de comprobante del pago de revisión' })
  @IsOptional()
  @IsString()
  @UpperCase()
  comprobanteRevision?: string;

  @ApiPropertyOptional({
    description: 'Pago de revisión. Si el protocolo es una enmienda o tiene convenio, se registra como 0.',
    example: 150.0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  pagoRevision?: number;

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

  @ApiPropertyOptional({ description: '¿Cuenta con constancia ética?', default: false })
  @IsOptional()
  @IsBoolean()
  tieneConstanciaEtica?: boolean;

  @ApiPropertyOptional({ description: 'N° o código de la constancia ética (obligatorio si cuenta con constancia)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @UpperCase()
  idConstanciaEtica?: string;

  @ApiPropertyOptional({ description: 'Fecha de la constancia ética (obligatoria si cuenta con constancia)', example: '2026-01-20' })
  @IsOptional()
  @IsDateString()
  fechaConstancia?: string;

  @ApiPropertyOptional({ description: '¿Cuenta con consentimiento informado?', default: false })
  @IsOptional()
  @IsBoolean()
  consentimientoInformado?: boolean;

  @ApiPropertyOptional({ description: 'Departamento al que se dirige el permiso' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  @UpperCase()
  departamentoDirigidoPermiso?: string;

  @ApiPropertyOptional({
    description: 'Certificado de buenas prácticas. Solo aplica si el protocolo requiere revisión de historia clínica.',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  certificadoBuenasPracticas?: boolean;
}
