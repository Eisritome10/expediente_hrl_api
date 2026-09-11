export class PaginatedMetaDto {
  private constructor(
    readonly page: number,
    readonly limit: number,
    readonly total: number,
  ) {}

  static from(page: number, limit: number, total: number): PaginatedMetaDto {
    return new PaginatedMetaDto(page, limit, total);
  }
}

export class PaginatedResultResponseDto<T> {
  private constructor(
    readonly data: T[],
    readonly meta: PaginatedMetaDto,
  ) {}

  static from<T>(data: T[], page: number, limit: number, total: number): PaginatedResultResponseDto<T> {
    return new PaginatedResultResponseDto(data, PaginatedMetaDto.from(page, limit, total));
  }
}
