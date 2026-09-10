import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig],
      ignoreEnvFile: isProduction,
      envFilePath: `.env.${env}`,
      isGlobal: true
    })
  ]
})
export class AppConfigModule {}
