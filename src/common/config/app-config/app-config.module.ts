import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig } from './app.config';
import { jwtConfig } from './jwt.config';
import { reniecConfig } from './reniec.config';
import { validationSchema } from './schema/validation.schema';

const env = process.env.NODE_ENV || 'development';
const isProduction = env === 'production';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [appConfig, jwtConfig, reniecConfig],
      validationSchema,
      ignoreEnvFile: isProduction,
      envFilePath: `.env.${env}`,
      isGlobal: true
    })
  ]
})
export class AppConfigModule {}
