import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BettingService } from './betting.service';
import { BettingController } from './betting.controller';
import { Match } from './entities/match.entity';
import { Bet } from './entities/bet.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([Match, Bet], 'betting_con'),
        PassportModule,
        ClientsModule.register([
            {
                name: 'WALLET_SERVICE',
                transport: Transport.RMQ,
                options: {
                    urls: ['amqp://user:password@trd-rabbitmq:5672'],
                    queue: 'wallet_queue',
                    queueOptions: { durable: false },
                },
            },
        ]),
    ],
    controllers: [BettingController],
    providers: [BettingService, JwtStrategy],
})
export class BettingModule {}