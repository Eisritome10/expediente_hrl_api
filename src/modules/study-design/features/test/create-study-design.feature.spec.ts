import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { CreateStudyDesignFeature } from '../create-study-design.feature';
import { StudyDesignNameAlreadyExistsException } from '../../exceptions/study-design-name-already-exists.exception';

describe('CreateStudyDesignFeature', () => {
  const prisma = { studyDesign: { create: jest.fn() } } as unknown as PrismaService;
  const feature = new CreateStudyDesignFeature(prisma);

  const input = { name: 'Descriptivo transversal' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a study design', async () => {
    const created = { id: 'sd1', ...input, createdAt: new Date(), updatedAt: new Date() };
    (prisma.studyDesign.create as jest.Mock).mockResolvedValue(created);

    await expect(feature.execute(input)).resolves.toEqual(created);
    expect(prisma.studyDesign.create).toHaveBeenCalledWith({ data: input });
  });

  it('throws StudyDesignNameAlreadyExistsException on a duplicate name', async () => {
    (prisma.studyDesign.create as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'study_designs_name_key' } } } },
      }),
    );

    await expect(feature.execute(input)).rejects.toBeInstanceOf(StudyDesignNameAlreadyExistsException);
  });
});
