import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpInput, LoginInput } from './dto/inputs';
import { AuthResponse } from './types/auth-response-type';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ValidRoles } from './enums/valid-roles.enum';

@Resolver(() => AuthResponse)
export class AuthResolver {
  constructor(private readonly authService: AuthService) { }

  @Mutation(() => AuthResponse, { name: "signup" })
  signUp(@Args("signUpInput") signUpInput: SignUpInput): Promise<AuthResponse> {

    return this.authService.signup(signUpInput)
  }


  @Mutation(() => AuthResponse, { name: "login" })
  async login(
    @Args("LoginInput") loginInput: LoginInput
  ): Promise<AuthResponse> {
    return this.authService.login(loginInput)
  }

  @Query(() => AuthResponse, { name: "revalidate" })
  @UseGuards(JwtAuthGuard)
  revalidateToken(
    @CurrentUser(/**[ValidRoles.admin]**/) user: User
  ): AuthResponse {
    return this.authService.revalidateToken(user)
  }
}

