import { CanActivate,
        ExecutionContext, 
        ForbiddenException, 
        Injectable, 
        UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UsersService } from "../users/users.service";
import { IS_PUBLIC_KEY } from "./public.decorator";
import { AuthService } from "./auth.service";
import { REQUIRED_ROLE_KEY } from "./admin.decorator";



@Injectable()
export class JwtAuthGuard implements CanActivate{

    constructor(
        private readonly reflector: Reflector,
        //this reads the data from your meta decorator

        private readonly authService : AuthService,

        private readonly usersService : UsersService,
    ){

    }
    async canActivate(context: ExecutionContext){
        //if the handler is marked as public means anyone can access this route

        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass()
        ])

        //this reads the metadata, if it's public the reflector stays inactive

        if(isPublic){
            return true
        }
        //if the route isn't public then the reflector takes effect and requests authorization
        const req = context.switchToHttp().getRequest()as any;

        const authorization = req.headers['authorization'];

        if(!authorization || typeof authorization !== 'string'){
            throw new UnauthorizedException('Missing authorization header')
        }

        //extract the token from bearer

        const token = authorization.startsWith('Bearer ')?
        authorization.slice('Bearer '.length).trim(): ''

        if(!token){
            throw new UnauthorizedException('Missing token')
        }

        //verify the token

        const identifyAuthUser = await this.authService.verifyAndBuildContext(token);

        const dbUser = await this.usersService.upsertAuthUser({
            clerkUserId : identifyAuthUser.clerkUserId,
            email : identifyAuthUser.email,
            name: identifyAuthUser.name
        })

        const user = {
            ...identifyAuthUser,
            role : dbUser.role,
        }

        //attach user, so controllers can read it via @currentUser()
        req.user = user;



        const requiredRole = this.reflector.getAllAndOverride<string>(REQUIRED_ROLE_KEY, [
            context.getHandler(), context.getClass()
        ])

        if(requiredRole === 'admin' && user.role !== 'admin'){
            throw new ForbiddenException('Admin access required')
        }

        return true
    }

}