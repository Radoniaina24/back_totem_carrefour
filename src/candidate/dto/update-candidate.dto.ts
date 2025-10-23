import { PartialType } from '@nestjs/mapped-types';
import { CreateCandidateDto } from './create-candidate.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCandidateDto extends PartialType(CreateCandidateDto) {
  @ApiPropertyOptional({
    description: 'Optional file replacement URL or path',
    example: 'https://example.com/uploads/new-cv.pdf',
  })
  file: string;
}
