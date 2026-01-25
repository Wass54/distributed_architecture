import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class IdentityService {
    constructor(
        @InjectRepository(User, 'identity_con')
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) {}

    // Inscription
    async register(data: { email: string; password: string; username: string }) {
        const existing = await this.userRepository.findOneBy({ email: data.email });
        if (existing) throw new BadRequestException('Email déjà utilisé');

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const user = this.userRepository.create({
            ...data,
            password: hashedPassword,
        });

        const savedUser = await this.userRepository.save(user);
        const { password, ...result } = savedUser;
        return result;
    }

    // Connexion
    async login(data: { email: string; password: string }) {
        const user = await this.userRepository.findOneBy({ email: data.email });
        if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');

        const isMatch = await bcrypt.compare(data.password, user.password);
        if (!isMatch) throw new UnauthorizedException('Email ou mot de passe incorrect');

        const payload = { sub: user.id, username: user.username };
        return {
            access_token: this.jwtService.sign(payload),
            userId: user.id
        };
    }
}