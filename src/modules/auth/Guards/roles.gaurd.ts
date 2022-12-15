import { CanActivate, ExecutionContext } from "@nestjs/common";
import { Observable } from "rxjs";
import { RolerUser } from "src/common/Enums";

export class RolesGaurd implements CanActivate {
  private role: RolerUser = RolerUser.MOD;

  constructor(role: RolerUser) {
    this.role = role;
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req: any = context.switchToHttp().getRequest();
    const user = req.user;

    return this.role === user.role;
  }
}