import { Prisma } from '@prisma/client';

export const PROTOCOL_REVIEW_INCLUDE = {
  reviewer: { select: { id: true, username: true, fullName: true } },
  observationItems: { orderBy: [{ type: 'asc' }, { createdAt: 'asc' }] },
} satisfies Prisma.ProtocolReviewInclude;

export type ProtocolReviewWithRelations = Prisma.ProtocolReviewGetPayload<{
  include: typeof PROTOCOL_REVIEW_INCLUDE;
}>;
