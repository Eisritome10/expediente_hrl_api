import { PartialType } from '@nestjs/swagger';
import { CreateDestinationRequestDto } from './create-destination.request.dto';

export class UpdateDestinationRequestDto extends PartialType(CreateDestinationRequestDto) {}
