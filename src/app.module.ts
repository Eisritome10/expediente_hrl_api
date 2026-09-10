import { Module } from '@nestjs/common';
import { AppConfigModule } from './common/config/app-config/app-config.module';

@Module({
  imports: [AppConfigModule],
})
export class AppModule {}
