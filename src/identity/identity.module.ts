import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { IdentityService } from './identity.service';
import { IdentityController } from './identity.controller';
import { User } from './entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([User], 'identity_con'),
        JwtModule.register({
            secret: 'SECRET_KEY_PROJET_M2',
            signOptions: { expiresIn: '1h' },
        }),
    ],
    controllers: [IdentityController],
    providers: [IdentityService],
    exports: [IdentityService, JwtModule],
})
export class IdentityModule {}