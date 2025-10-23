import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { UserIdMiddleware } from './middlewares/user-id.middleware';
import { UserGateway } from './user/user.gateway';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CandidateModule } from './candidate/candidate.module';
import { CvModule } from './cv/cv.module';

@Module({
  controllers: [AppController],
  providers: [AppService, UserGateway],
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    UserModule,
    AuthModule,
    CloudinaryModule,
    CandidateModule,
    CvModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(UserIdMiddleware)
      .forRoutes(
        { path: 'user-profiles/me', method: RequestMethod.ALL },
        { path: 'users', method: RequestMethod.ALL },
      );
  }
}
