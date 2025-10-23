import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from './cloudinary.service';
import { Express } from 'express';

@Controller('upload')
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  @Post('file')
  @UseInterceptors(FileInterceptor('file')) // le champ "file" dans ton form-data
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier reçu');
    }

    try {
      // Upload via le service Cloudinary
      const result = await this.cloudinaryService.uploadFile(file);

      // ✅ Retourne l'URL publique, utilisable directement dans le front
      return {
        url: result.secure_url,
        originalName: file.originalname,
        format: file.mimetype,
        size: file.size,
      };
    } catch (error) {
      console.error('Erreur Cloudinary:', error);
      throw new BadRequestException(
        'Erreur lors de l’upload du fichier sur Cloudinary',
      );
    }
  }
}
