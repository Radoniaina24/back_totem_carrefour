import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { Candidate, CandidateDocument } from './schema/candidate.schema';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
  ) {}

  //  CREATE

  async create(createCandidateDto: CreateCandidateDto): Promise<Candidate> {
    try {
      const candidate = new this.candidateModel(createCandidateDto);
      return await candidate.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException('Email already exists.');
      }
      throw new InternalServerErrorException('Error creating candidate.');
    }
  }

  //  READ - ALL
  async findAll(): Promise<Candidate[]> {
    try {
      return await this.candidateModel.find().sort({ createdAt: -1 }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Error retrieving candidates.');
    }
  }

  //  READ - ONE
  async findOne(id: string): Promise<Candidate> {
    try {
      const candidate = await this.candidateModel.findById(id).exec();
      if (!candidate) throw new NotFoundException('Candidate not found.');
      return candidate;
    } catch (error) {
      if (error.kind === 'ObjectId')
        throw new BadRequestException('Invalid ID format.');
      throw new InternalServerErrorException('Error retrieving candidate.');
    }
  }

  //  UPDATE
  async update(id: string, updateDto: UpdateCandidateDto): Promise<Candidate> {
    try {
      const updated = await this.candidateModel
        .findByIdAndUpdate(id, updateDto, { new: true, runValidators: true })
        .exec();

      if (!updated) throw new NotFoundException('Candidate not found.');
      return updated;
    } catch (error) {
      if (error.kind === 'ObjectId')
        throw new BadRequestException('Invalid ID format.');
      throw new InternalServerErrorException('Error updating candidate.');
    }
  }

  //  DELETE
  async remove(id: string): Promise<{ message: string }> {
    try {
      const deleted = await this.candidateModel.findByIdAndDelete(id).exec();
      if (!deleted) throw new NotFoundException('Candidate not found.');
      return { message: 'Candidate successfully deleted.' };
    } catch (error) {
      if (error.kind === 'ObjectId')
        throw new BadRequestException('Invalid ID format.');
      throw new InternalServerErrorException('Error deleting candidate.');
    }
  }
}
