import * as bcrypt from "bcrypt"
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import { SignUpInput, LoginInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response-type';
import { UsersService } from '../users/users.service';
import { User } from "src/users/entities/user.entity";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ) { }

    private getJwtToken(userId: string) {
        return this.jwtService.sign({ id: userId })
    }

    async signup(signUpInput: SignUpInput): Promise<AuthResponse> {
        const user = await this.usersService.create(signUpInput)
        const token = this.getJwtToken(user.id)
        return { token, user }
    }

    async login({ email, password }: LoginInput): Promise<AuthResponse> {
        const user = await this.usersService.findOneByEmail(email)
        if (!bcrypt.compareSync(password, user.password)) {
            throw new BadRequestException(`Email/Password incorrectos`)
        }
        const token = this.getJwtToken(user.id)
        return { token, user }
    }

    async validateUser(id: string): Promise<User> {
        const user = await this.usersService.findOneById(id)
        if (!user.isActive) throw new UnauthorizedException("Usuario Inactivo, comunicarse con el Admin")
        delete user.password
        return user
    }
    revalidateToken(user: User): AuthResponse {
        const token = this.getJwtToken(user.id)
        return {
            token,
            user
        }
    }
}
