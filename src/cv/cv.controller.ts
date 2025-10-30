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
  UseGuards,
  Res,
  NotFoundException,
} from '@nestjs/common';
import { CvService } from './cv.service';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { CurrentUserId } from 'src/common/decorators/current-user-id.decorator';
@Controller('cv')
export class CvController {
  constructor(
    private readonly cvService: CvService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  //  Créer un CV
  @Post()
  @Roles('candidate')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUserId() userId: string,
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
      const newCv = await this.cvService.create(createCvDto, userId);

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
  @Get('/myCv')
  @Roles('candidate', 'admin', 'recruiter')
  async findOneForUser(@CurrentUserId() userId: string) {
    // console.log(userId);
    try {
      const cv = await this.cvService.findMyCv(userId);
      return { message: 'CV récupérée.', data: cv };
    } catch (error) {
      return {
        message: error.message || 'CV introuvable ou accès refusé.',
      };
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

  @Patch('/updateMyCv/:id')
  @Roles('candidate')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.OK)
  async updateMyCv(
    @Param('id') cvId: string,
    @CurrentUserId() userId: string,
    @UploadedFile() file?: Express.Multer.File,
    @Body('data') data?: string,
  ) {
    try {
      // Vérification de la présence des données
      if (!data) {
        throw new BadRequestException('Aucune donnée reçue dans la requête.');
      }

      // Parsing du JSON reçu
      const updateCvDto: UpdateCvDto = JSON.parse(data);

      // Vérifier la présence de l’email dans les informations personnelles
      if (!updateCvDto.personalInfo?.email) {
        throw new BadRequestException(
          "L'email est requis dans les informations personnelles.",
        );
      }

      //  Vérifier si un autre CV possède déjà cet email
      // const emailOwner = await this.cvService.findByEmail(
      //   updateCvDto.personalInfo.email,
      // );

      // if (emailOwner) {
      //   throw new BadRequestException(
      //     'Cet email est déjà utilisé par un autre CV.',
      //   );
      // }

      // Upload Cloudinary si un nouveau fichier est présent
      if (file) {
        const uploadResult = await this.cloudinaryService.uploadFile(file);
        updateCvDto.personalInfo.photo = uploadResult.secure_url;
      }

      // Mise à jour du CV
      const updatedCv = await this.cvService.updateMyCv(
        cvId,
        updateCvDto,
        userId,
      );

      // Réponse professionnelle
      return {
        statusCode: HttpStatus.OK,
        message: 'CV mis à jour avec succès.',
        data: updatedCv,
      };
    } catch (error) {
      // Gestion des erreurs prévues
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      // Gestion d’erreurs MongoDB (clé unique email)
      if (error?.code === 11000 && error.keyPattern?.['personalInfo.email']) {
        throw new BadRequestException("L'adresse email existe déjà.");
      }

      console.error('Erreur interne lors de la mise à jour du CV :', error);

      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la mise à jour du CV. Veuillez réessayer plus tard.',
      );
    }
  }
  // sdsd
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
