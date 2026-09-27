import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ProtocolReviewController } from './protocol-review.controller';
import { CreateProtocolReviewFeature } from './features/create-protocol-review.feature';
import { ListProtocolReviewsFeature } from './features/list-protocol-reviews.feature';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [ProtocolReviewController],
  providers: [CreateProtocolReviewFeature, ListProtocolReviewsFeature],
})
export class ProtocolReviewModule {}
