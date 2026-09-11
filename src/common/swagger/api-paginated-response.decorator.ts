import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { PaginatedMetaDto } from '../dtos/response/paginated-result.response.dto';

export const ApiPaginatedResponse = (model: Function) => // eslint-disable-line @typescript-eslint/ban-types
  applyDecorators(
    ApiExtraModels(PaginatedMetaDto, model),
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(model) },
              },
              meta: { $ref: getSchemaPath(PaginatedMetaDto) },
            },
          },
        ],
      },
    }),
  );
