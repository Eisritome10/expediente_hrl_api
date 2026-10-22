import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';
import { CreateProtocolRequestDto } from '../request/create-protocol.request.dto';
import { UpdateProtocolRequestDto } from '../request/update-protocol.request.dto';

type ProtocolRequestDto = CreateProtocolRequestDto | UpdateProtocolRequestDto;

const numeroExpedienteErrors = async (
  dtoClass: ClassConstructor<ProtocolRequestDto>,
  numeroExpediente?: unknown,
): Promise<ValidationError[]> => {
  const payload = numeroExpediente === undefined ? {} : { numeroExpediente };
  const errors = await validate(plainToInstance(dtoClass, payload));

  return errors.filter((error) => error.property === 'numeroExpediente');
};

describe('CreateProtocolRequestDto numeroExpediente', () => {
  it.each(['1', '542', '12345'])('accepts %p', async (value) => {
    const errors = await numeroExpedienteErrors(CreateProtocolRequestDto, value);

    expect(errors).toHaveLength(0);
  });

  it.each(['', '123456', '12a', '542/2026', ' 542', '-5'])('rejects %p', async (value) => {
    const errors = await numeroExpedienteErrors(CreateProtocolRequestDto, value);

    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('UpdateProtocolRequestDto numeroExpediente', () => {
  it('accepts a payload without numeroExpediente', async () => {
    const errors = await numeroExpedienteErrors(UpdateProtocolRequestDto);

    expect(errors).toHaveLength(0);
  });

  it('accepts a 5-digit numeroExpediente', async () => {
    const errors = await numeroExpedienteErrors(UpdateProtocolRequestDto, '12345');

    expect(errors).toHaveLength(0);
  });

  it('rejects a 6-digit numeroExpediente', async () => {
    const errors = await numeroExpedienteErrors(UpdateProtocolRequestDto, '123456');

    expect(errors.length).toBeGreaterThan(0);
  });
});
