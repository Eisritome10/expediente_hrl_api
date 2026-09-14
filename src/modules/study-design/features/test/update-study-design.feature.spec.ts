import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../prisma/prisma.service';
import { UpdateStudyDesignFeature } from '../update-study-design.feature';
import { FindStudyDesignByIdFeature } from '../find-study-design-by-id.feature';
import { StudyDesignNameAlreadyExistsException } from '../../exceptions/study-design-name-already-exists.exception';

describe('UpdateStudyDesignFeature', () => {
  const prisma = { studyDesign: { update: jest.fn() } } as unknown as PrismaService;
  const findStudyDesignByIdFeature = { execute: jest.fn() } as unknown as FindStudyDesignByIdFeature;
  const feature = new UpdateStudyDesignFeature(prisma, findStudyDesignByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('updates the study design after checking it exists', async () => {
    const existing = { id: 'sd1' };
    const updated = { id: 'sd1', name: 'Nuevo Nombre' };
    (findStudyDesignByIdFeature.execute as jest.Mock).mockResolvedValue(existing);
    (prisma.studyDesign.update as jest.Mock).mockResolvedValue(updated);

    await expect(feature.execute('sd1', { name: 'Nuevo Nombre' })).resolves.toEqual(updated);
    expect(findStudyDesignByIdFeature.execute).toHaveBeenCalledWith('sd1');
  });

  it('throws StudyDesignNameAlreadyExistsException on a duplicate name', async () => {
    (findStudyDesignByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'sd1' });
    (prisma.studyDesign.update as jest.Mock).mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('duplicate', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: { driverAdapterError: { cause: { constraint: { index: 'study_designs_name_key' } } } },
      }),
    );

    await expect(
      feature.execute('sd1', { name: 'Duplicado' }),
    ).rejects.toBeInstanceOf(StudyDesignNameAlreadyExistsException);
  });
});
