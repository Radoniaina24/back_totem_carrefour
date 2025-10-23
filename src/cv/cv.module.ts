import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CVData, CVDataSchema } from './schema/cv.schema';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { CvGateway } from './cv.gateway';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CVData.name, schema: CVDataSchema }]),
    CloudinaryModule,
  ],
  controllers: [CvController],
  providers: [CvService, CvGateway],
  exports: [CvService],
})
export class CvModule {}
