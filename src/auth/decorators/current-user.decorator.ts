import { createParamDecorator, ExecutionContext, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ValidRoles } from '../enums/valid-roles.enum';
import { User } from '../../users/entities/user.entity';

export const CurrentUser = createParamDecorator(
    (roles: ValidRoles[] = [], context: ExecutionContext) => {
        const ctx = GqlExecutionContext.create(context)
        const user: User = ctx.getContext().req.user

        if (!user) {
            throw new InternalServerErrorException("no hay usuario dentro de la request, asegurarse de usar AuthGuard")
        }

        if (roles.length === 0) return user

        for (const role of user.roles) {
            if (roles.includes(role as ValidRoles)) return user
        }

        throw new ForbiddenException(`usuario: ${user.fullName} autenticado pero no autorizado, necesita rol valido [${roles}]"`)

    })