import { Module } from '@nestjs/common';
import { NotifyModule } from './notify/notify.module';
import { ConfigModule } from '@nestjs/config';
import bitrixConfig from './config/bitrix.config';
import mailConfig from './config/mail.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      envFilePath: '.env',
      load: [bitrixConfig, mailConfig],
    }),
    NotifyModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
