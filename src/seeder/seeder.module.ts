import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { SeederService } from './seeder.service';

@Module({
  imports: [PrismaModule],
  providers: [SeederService],
})
export class SeederModule {}
