import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BettingModule } from './betting/betting.module';
import { WalletModule } from './wallet/wallet.module';
import { IdentityModule } from './identity/identity.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Match } from './betting/entities/match.entity';
import { Bet } from './betting/entities/bet.entity';
import { Wallet } from './wallet/entities/wallet.entity';
import { User } from './identity/entities/user.entity';

@Module({
    imports: [
        // Connexion 1 : Betting (Port 5434)
        TypeOrmModule.forRoot({
            name: 'betting_con',
            type: 'postgres',
            host: 'trd-db-betting',
            port: 5432,
            username: 'betting_user',
            password: 'betting_password',
            database: 'betting_db',
            entities: [Match, Bet],
            synchronize: true,
        }),

        // Connexion 2 : Wallet (Port 5435)
        TypeOrmModule.forRoot({
            name: 'wallet_con',
            type: 'postgres',
            host: 'trd-db-wallet',
            port: 5432,
            username: 'wallet_user',
            password: 'wallet_password',
            database: 'wallet_db',
            entities: [Wallet],
            synchronize: true,
        }),

        // Connexion 3 : Identity (Port 5436)
        TypeOrmModule.forRoot({
            name: 'identity_con',
            type: 'postgres',
            host: 'trd-db-identity',
            port: 5432,
            username: 'identity_user',
            password: 'identity_password',
            database: 'identity_db',
            entities: [User],
            synchronize: true,
        }),

        BettingModule,
        WalletModule,
        IdentityModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}