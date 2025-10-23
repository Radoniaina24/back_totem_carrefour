import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  InternalServerErrorException,
  Query,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Controller('cv')
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  //  Créer un CV
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UploadedFile() file?: Express.Multer.File,
    @Body('data') data?: string,
  ) {
    try {
      //  Vérification de la présence des données
      if (!data) {
        throw new BadRequestException('Aucune donnée reçue dans la requête.');
      }

      //  Parsing du JSON
      const createCvDto: CreateCvDto = JSON.parse(data);

      // Vérification de la présence de l'email
      if (!createCvDto.personalInfo?.email) {
        throw new BadRequestException(
          "L'email est requis dans les informations personnelles.",
        );
      }

      //  Vérifier si un CV avec cet email existe déjà
      const existingCv = await this.cvService.findByEmail(
        createCvDto.personalInfo.email,
      );

      if (existingCv) {
        throw new BadRequestException(`Un autre CV utilise déjà l'email.`);
      }

      //  Upload Cloudinary si un fichier est présent
      if (file) {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        createCvDto.personalInfo.photo = uploadResult.secure_url;
      }

      //  Création du CV
      const newCv = await this.cvService.create(createCvDto);

      //  Réponse claire et professionnelle
      return {
        statusCode: HttpStatus.CREATED,
        message: 'CV créé avec succès ',
        data: newCv,
      };
    } catch (error) {
      //  Gestion fine des erreurs connues
      if (error instanceof BadRequestException) {
        throw error;
      }

      //  Gestion des erreurs MongoDB (email unique par index)
      if (error?.code === 11000 && error.keyPattern?.['personalInfo.email']) {
        throw new BadRequestException(`L'adresse email existe déjà.`);
      }

      console.error('Erreur interne lors de la création du CV:', error);

      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la création du CV. Veuillez réessayer plus tard.',
      );
    }
  }

  //  Récupérer tous les CVs
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search = '',
  ) {
    return this.cvService.findAll({
      page,
      limit,
      search,
    });
  }

  //  Récupérer un CV par ID
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id') id: string) {
    return this.cvService.findOne(id);
  }

  //  Mettre à jour un CV
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() updateCvDto: UpdateCvDto) {
    return this.cvService.update(id, updateCvDto);
  }

  //  Supprimer un CV
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    return this.cvService.remove(id);
  }
}
