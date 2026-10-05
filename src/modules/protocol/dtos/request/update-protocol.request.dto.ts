import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateProtocolRequestDto } from './create-protocol.request.dto';

// El protocolo original es inmutable: una corrección nunca cambia la condición de enmienda.
export class UpdateProtocolRequestDto extends PartialType(
  OmitType(CreateProtocolRequestDto, ['protocoloOriginalId'] as const),
) {
  @ApiPropertyOptional({
    description:
      'Comentario de la corrección. Se guarda en el historial; sirve cuando el cambio se hizo fuera del sistema o no se puede hacer aquí',
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  correctionComment?: string;
}
