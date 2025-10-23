import { Module } from '@nestjs/common';
import { CandidatesController } from './candidate.controller';
import { CandidatesService } from './candidate.service';
import { Candidate, CandidateSchema } from './schema/candidate.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
    ]),
    CloudinaryModule,
  ],
  controllers: [CandidatesController],
  providers: [CandidatesService],
})
export class CandidateModule {}
