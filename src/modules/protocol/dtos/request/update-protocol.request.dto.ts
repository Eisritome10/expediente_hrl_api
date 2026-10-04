import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateProtocolRequestDto } from './create-protocol.request.dto';

// El protocolo original es inmutable: una corrección nunca cambia la condición de enmienda.
export class UpdateProtocolRequestDto extends PartialType(
  OmitType(CreateProtocolRequestDto, ['protocoloOriginalId'] as const),
) {}
