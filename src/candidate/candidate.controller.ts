import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CandidatesService } from './candidate.service';
import { Candidate } from './schema/candidate.schema';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@ApiTags('Candidates')
@Controller('candidates')
export class CandidatesController {
  constructor(
    private readonly candidatesService: CandidatesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // CREATE
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Create a new candidate' })
  @ApiResponse({
    status: 201,
    description: 'Candidate created successfully.',
    type: Candidate,
  })
  async create(
    @Body() createCandidateDto: CreateCandidateDto,
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
  ) {
    try {
      if (file) {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        createCandidateDto.file = uploadResult.secure_url;
      }
      const candidate = await this.candidatesService.create(createCandidateDto);

      return res.status(HttpStatus.CREATED).json({
        message: 'Candidat ajouter avec succès',
        data: candidate,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: error });
    }
  }

  // GET ALL
  @Get()
  @ApiOperation({ summary: 'Get all candidates' })
  @ApiResponse({
    status: 200,
    description: 'List of candidates.',
    type: [Candidate],
  })
  async findAll() {
    return await this.candidatesService.findAll();
  }

  // GET ONE
  @Get(':id')
  @ApiOperation({ summary: 'Get candidate by ID' })
  @ApiResponse({
    status: 200,
    description: 'Candidate found.',
    type: Candidate,
  })
  @ApiResponse({ status: 404, description: 'Candidate not found.' })
  async findOne(@Param('id') id: string) {
    return await this.candidatesService.findOne(id);
  }

  // UPDATE
  @Patch(':id')
  @ApiOperation({ summary: 'Update candidate by ID' })
  @ApiResponse({
    status: 200,
    description: 'Candidate updated successfully.',
    type: Candidate,
  })
  async update(
    @Param('id') id: string,
    @Body() updateCandidateDto: UpdateCandidateDto,
  ) {
    return await this.candidatesService.update(id, updateCandidateDto);
  }

  // DELETE
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete candidate by ID' })
  @ApiResponse({ status: 204, description: 'Candidate deleted successfully.' })
  async remove(@Param('id') id: string) {
    return await this.candidatesService.remove(id);
  }
}
