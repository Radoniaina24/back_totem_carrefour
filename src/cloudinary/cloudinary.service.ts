import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { Express } from 'express';

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
  }

  /**
   * Upload d'un fichier vers Cloudinary (PDF ou image)
   * @param file Express.Multer.File
   * @returns URL publique du fichier
   */
  async uploadFile(file: Express.Multer.File): Promise<{
    secure_url: string;
    originalName: string;
    format: string;
    size: number;
  }> {
    const isPdf = file.mimetype === 'application/pdf';

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'candidates', // dossier Cloudinary
          resource_type: isPdf ? 'raw' : 'auto', // raw pour PDF, auto pour images
          overwrite: true,
        },
        (error: any, result: UploadApiResponse | undefined) => {
          if (error) return reject(error);
          if (!result)
            return reject(new Error('No result returned from Cloudinary'));

          // Retourne l'URL publique, force resource_type raw pour PDF

          const secureUrl = isPdf
            ? result.secure_url.replace('/image/upload/', '/raw/upload/')
            : result.secure_url;

          resolve({
            secure_url: isPdf ? `${secureUrl}.pdf` : secureUrl,
            originalName: file.originalname,
            format: file.mimetype,
            size: file.size,
          });
        },
      );

      // Pipe le buffer du fichier vers Cloudinary
      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }
}
