import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './Guards/jwt.strategy';
import { PublicModules } from 'src/common/PublicModules';
import { FacebookStrategy } from './Guards/facebook.strategy';
import { GoogleStrategy } from './Guards/google.strategy';

@Module({
  imports: [
    PublicModules.PASSPORT_MODULE,
    JwtModule.register({
      secret: PublicModules.TOKEN_SECRETKEY,
      signOptions: {
        expiresIn: PublicModules.TOKEN_EXPIRESIN,
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    FacebookStrategy,
    GoogleStrategy,
  ],
  exports: [AuthService,]
})
export class AuthModule { }
