import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { Wallet } from './entities/wallet.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
    imports: [
        TypeOrmModule.forFeature([Wallet], 'wallet_con'),
        PassportModule,
    ],
    controllers: [WalletController],
    providers: [WalletService, JwtStrategy],
    exports: [WalletService], 
})
export class WalletModule {}