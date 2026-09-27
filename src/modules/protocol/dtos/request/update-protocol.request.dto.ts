import { PartialType } from '@nestjs/swagger';
import { CreateProtocolRequestDto } from './create-protocol.request.dto';

export class UpdateProtocolRequestDto extends PartialType(CreateProtocolRequestDto) {}
