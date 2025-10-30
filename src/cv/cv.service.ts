import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { CVData, CvDocument } from './schema/cv.schema';
import { PaginationOptions } from 'src/interfaces/pagination-options.interface';
import { CvGateway } from './cv.gateway';

@Injectable()
export class CvService {
  constructor(
    @InjectModel(CVData.name) private readonly cvModel: Model<CVData>,
    private readonly cvGateway: CvGateway,
  ) {}

  // Créer un CV
  async create(createCvDto: CreateCvDto, userId: string) {
    try {
      const cv = await this.cvModel.create({ ...createCvDto, user: userId });
      this.cvGateway.cvCreated(cv);
      return {
        success: true,
        message: 'CV créé avec succès.',
        data: cv,
      };
    } catch (error) {
      console.error('Erreur lors de la création du CV:', error);
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la création du CV.',
      );
    }
  }

  //  Récupérer tous les CVs
  async findAll(
    paginationOptions: PaginationOptions = { page: 1, limit: 10, search: '' },
  ) {
    const { page, limit, search } = paginationOptions;
    const skip = (page - 1) * limit;
    const searchFilter = search
      ? {
          $or: [
            { 'personalInfo.email': { $regex: search, $options: 'i' } },
            { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
            { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
            {
              'personalInfo.professionalTitle': {
                $regex: search,
                $options: 'i',
              },
            },
          ],
        }
      : {};
    try {
      const [cv, total] = await Promise.all([
        this.cvModel.find(searchFilter).skip(skip).limit(limit).exec(),
        this.cvModel.countDocuments(searchFilter).exec(),
      ]);

      return {
        data: cv,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
      // const cvs = await this.cvModel.find().sort({ createdAt: -1 }).exec();
      // return {
      //   success: true,
      //   message: 'Liste des CVs récupérée avec succès.',
      //   data: cvs,
      // };
    } catch (error) {
      console.error('Erreur lors de la récupération des CVs:', error);
      throw new InternalServerErrorException(
        'Impossible de récupérer la liste des CVs.',
      );
    }
  }
  async findMyCv(userId: string): Promise<CVData> {
    // console.log(userId);
    const cv = await this.cvModel
      .findOne({
        user: userId,
      })
      .populate('user', 'lastName firstName email')
      .exec();
    if (!cv) {
      throw new NotFoundException('CV non trouvée ou accès non autorisé.');
    }
    console.log(cv);
    return cv;
  }
  //  Récupérer un CV par ID
  async findOne(id: string) {
    try {
      const cv = await this.cvModel.findById(id).exec();
      if (!cv) {
        throw new NotFoundException('Aucun CV trouvé avec cet identifiant.');
      }

      return {
        success: true,
        message: 'CV récupéré avec succès.',
        data: cv,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      console.error('Erreur lors de la récupération du CV:', error);
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération du CV.',
      );
    }
  }

  //  Mettre à jour un CV
  async update(id: string, updateCvDto: UpdateCvDto) {
    try {
      const updatedCv = await this.cvModel
        .findByIdAndUpdate(id, updateCvDto, { new: true, runValidators: true })
        .exec();

      if (!updatedCv) {
        throw new NotFoundException('Aucun CV trouvé pour la mise à jour.');
      }

      return {
        success: true,
        message: 'CV mis à jour avec succès.',
        data: updatedCv,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      console.error('Erreur lors de la mise à jour du CV:', error);
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la mise à jour du CV.',
      );
    }
  }

  //  Supprimer un CV
  async remove(id: string) {
    try {
      const deletedCv = await this.cvModel.findByIdAndDelete(id).exec();

      if (!deletedCv) {
        throw new NotFoundException('Aucun CV trouvé pour la suppression.');
      }

      return {
        success: true,
        message: 'CV supprimé avec succès.',
        data: deletedCv,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      console.error('Erreur lors de la suppression du CV:', error);
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la suppression du CV.',
      );
    }
  }

  /**
   * 🔹 Recherche un CV par email (pour vérifier l’unicité)
   * @param email - L'adresse email du candidat
   * @returns Le document CV trouvé ou `null`
   */
  async findByEmail(email: string): Promise<CvDocument | null> {
    try {
      const cv = await this.cvModel.findOne({
        'personalInfo.email': email.toLowerCase(),
      });

      return cv;
    } catch (error) {
      console.error('Erreur lors de la recherche du CV par email:', error);
      throw new InternalServerErrorException(
        'Impossible de vérifier l’existence de cet email pour le moment.',
      );
    }
  }

  async updateMyCv(cvId: string, updateCvDto: UpdateCvDto, userId: string) {
    // console.log('cvID: ', cvId);
    try {
      // Vérifier si le CV existe et appartient à l'utilisateur
      const existingCv = await this.cvModel.findOne({
        _id: cvId,
        user: userId,
      });

      if (!existingCv) {
        throw new NotFoundException('CV introuvable ou non autorisé.');
      }

      // Mettre à jour le CV
      const updatedCv = await this.cvModel.findByIdAndUpdate(
        cvId,
        { ...updateCvDto, user: userId },
        { new: true, runValidators: true },
      );

      // Notifier via WebSocket Gateway (si applicable)
      this.cvGateway.cvUpdated(updatedCv as CVData);
      return {
        success: true,
        message: 'CV mis à jour avec succès.',
        data: updatedCv,
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du CV :', error);

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la mise à jour du CV.',
      );
    }
  }
  async findOneByIdAndUser(id: string, userId: string) {
    try {
      const cv = await this.cvModel
        .findOne({ _id: id, user: userId })
        .populate('user', '-password'); // Optionnel : peupler les infos de l'utilisateur sans le mot de passe

      if (!cv) {
        throw new NotFoundException('CV introuvable ou accès non autorisé.');
      }

      return cv;
    } catch (error) {
      console.error('Erreur lors de la récupération du CV :', error);
      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la récupération du CV.',
      );
    }
  }
}
