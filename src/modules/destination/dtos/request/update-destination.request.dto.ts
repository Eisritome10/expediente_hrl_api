import { PartialType } from '@nestjs/mapped-types';
import { CreateDestinationRequestDto } from './create-destination.request.dto';

export class UpdateDestinationRequestDto extends PartialType(CreateDestinationRequestDto) {}
