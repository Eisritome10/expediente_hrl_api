import { PrismaService } from '../../../../prisma/prisma.service';
import { FindStudyDesignByIdFeature } from '../find-study-design-by-id.feature';
import { StudyDesignNotFoundException } from '../../exceptions/study-design-not-found.exception';

describe('FindStudyDesignByIdFeature', () => {
  const prisma = { studyDesign: { findUnique: jest.fn() } } as unknown as PrismaService;
  const feature = new FindStudyDesignByIdFeature(prisma);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the study design when found', async () => {
    const studyDesign = { id: 'sd1', name: 'Descriptivo transversal' };
    (prisma.studyDesign.findUnique as jest.Mock).mockResolvedValue(studyDesign);

    await expect(feature.execute('sd1')).resolves.toEqual(studyDesign);
  });

  it('throws StudyDesignNotFoundException when missing', async () => {
    (prisma.studyDesign.findUnique as jest.Mock).mockResolvedValue(null);

    await expect(feature.execute('missing')).rejects.toBeInstanceOf(StudyDesignNotFoundException);
  });
});
