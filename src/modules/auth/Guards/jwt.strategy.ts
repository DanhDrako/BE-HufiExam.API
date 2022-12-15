import { HttpStatus, Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { TaskRes } from "src/common/Classess";
import { PublicModules } from "src/common/PublicModules";
import { AuthService } from "../auth.service";
import { JwtPayload } from "../dto/JwtPayload";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: PublicModules.TOKEN_SECRETKEY,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload);
    return user;
  }
}