import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

import { UserGateway } from './user.gateway';

interface FindAllUsersOptions {
  page?: number;
  limit?: number;
  search?: string;
  roles?: string[];
  isActive?: boolean;
}
interface UserForTaskDto {
  _id: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  roles: string[];
}
interface PaginatedUsersResult {
  data: User[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly userGateway: UserGateway,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const userExists = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (userExists) {
      throw new ConflictException('Cet email est déjà utilisé');
    }
    const user = new this.userModel(createUserDto);
    const savedUser = await user.save();
    this.userGateway.userCreated(savedUser);
    return user.save();
  }

  async findAll(
    currentUserId: string,
    options: FindAllUsersOptions = {},
  ): Promise<PaginatedUsersResult> {
    const { page = 1, limit = 10, search = '', roles } = options;
    // console.log(roles);
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(Math.max(1, limit), 100);
    const skip = (validatedPage - 1) * validatedLimit;

    const query: Record<string, any> = {
      _id: { $ne: currentUserId }, // exclure l'utilisateur connecté
    };

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { email: searchRegex },
      ];
    }

    if (Array.isArray(roles) && roles.length > 0) {
      query.roles = { $in: roles };
    }

    // Exécution en parallèle
    const [data, total] = await Promise.all([
      this.userModel
        .find(query)
        .select('-password')
        .sort({ createdAt: -1 }) // Tri par date de création décroissante
        .skip(skip)
        .limit(validatedLimit)
        .exec(),
      this.userModel.countDocuments(query).exec(),
    ]);

    const totalPages = Math.ceil(total / validatedLimit);

    return {
      data,
      meta: {
        total,
        page: validatedPage,
        limit: validatedLimit,
        totalPages,
        hasNextPage: validatedPage < totalPages,
        hasPreviousPage: validatedPage > 1,
      },
    };
  }
  async findAllUserForTasks(): Promise<User[]> {
    const users = await this.userModel
      .find(
        {},
        {
          firstName: 1,
          lastName: 1,
        },
      )
      .select('-password')
      .exec();
    if (!users) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return users;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true, runValidators: true })
      .exec();
    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    this.userGateway.userUpdated(user);
    return user;
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Utilisateur non trouvé');
    }
    this.userGateway.userDeleted(id);
  }
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  async findByEmailWithPassword(email: string): Promise<UserDocument | null> {
    return await this.userModel.findOne({ email }).select('+password').exec();
  }
}
