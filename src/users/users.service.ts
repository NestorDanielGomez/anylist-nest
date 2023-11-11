import * as bcrypt from "bcrypt"
import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserInput } from './dto/create-user.input';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignUpInput } from '../auth/dto/inputs/signup.input';
import { Repository } from 'typeorm';
import { ValidRolesArgs } from "./dto/args/roles.arg";
import { ValidRoles } from "src/auth/enums/valid-roles.enum";

@Injectable()
export class UsersService {

  private logger: Logger = new Logger("UsersService")
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>
  ) { }

  async create(signUpInput: SignUpInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({ ...signUpInput, password: bcrypt.hashSync(signUpInput.password, 10) })
      return await this.usersRepository.save(newUser)

    } catch (error) {

      this.handleDBErros(error)
    }
  }

  async findAll(roles: ValidRoles[]): Promise<User[]> {
    if (roles.length === 0) return this.usersRepository.find(
      // tennemos lazy la propiedad lastUpdateBy
      // { relations: { lastUpdateBy: true } }
    )
    return this.usersRepository.createQueryBuilder()
      .andWhere("ARRAY[roles] && ARRAY[:...roles]")
      .setParameter("roles", roles)
      .getMany()

  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ email })
    } catch (error) {
      this.handleDBErros({
        code: "error-01",
        detail: `${email} no encontrado`
      })
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ id })
    } catch (error) {
      this.handleDBErros({
        code: "error-01",
        detail: `${id} no encontrado`
      })
    }
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  async block(id: string, adminUser: User): Promise<User> {
    const userToBlock = await this.findOneById(id)
    userToBlock.isActive = false
    userToBlock.lastUpdateBy = adminUser
    return await this.usersRepository.save(userToBlock)

  }

  private handleDBErros(error: any): never {

    if (error.code === "23505") {
      throw new BadRequestException(error.detail.replace("key", ""))
    }
    if (error.code === "error-01") {
      throw new BadRequestException(error.detail.replace("key", ""))
    }
    this.logger.error(error)
    throw new InternalServerErrorException("Chequear logs del servidor")
  }
}
