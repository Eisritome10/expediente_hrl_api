import { PrismaService } from '../../../../prisma/prisma.service';
import { DeleteStudyDesignFeature } from '../delete-study-design.feature';
import { FindStudyDesignByIdFeature } from '../find-study-design-by-id.feature';
import { StudyDesignNotFoundException } from '../../exceptions/study-design-not-found.exception';

describe('DeleteStudyDesignFeature', () => {
  const prisma = { studyDesign: { delete: jest.fn() } } as unknown as PrismaService;
  const findStudyDesignByIdFeature = { execute: jest.fn() } as unknown as FindStudyDesignByIdFeature;
  const feature = new DeleteStudyDesignFeature(prisma, findStudyDesignByIdFeature);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deletes the study design after checking it exists', async () => {
    (findStudyDesignByIdFeature.execute as jest.Mock).mockResolvedValue({ id: 'sd1' });
    (prisma.studyDesign.delete as jest.Mock).mockResolvedValue({ id: 'sd1' });

    await feature.execute('sd1');

    expect(findStudyDesignByIdFeature.execute).toHaveBeenCalledWith('sd1');
    expect(prisma.studyDesign.delete).toHaveBeenCalledWith({ where: { id: 'sd1' } });
  });

  it('propagates the not-found error without deleting', async () => {
    (findStudyDesignByIdFeature.execute as jest.Mock).mockRejectedValue(
      new StudyDesignNotFoundException('missing'),
    );

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(StudyDesignNotFoundException);
    expect(prisma.studyDesign.delete).not.toHaveBeenCalled();
  });
});
