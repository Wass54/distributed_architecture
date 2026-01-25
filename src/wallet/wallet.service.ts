import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletService {
    constructor(
        @InjectRepository(Wallet, 'wallet_con')
        private walletRepository: Repository<Wallet>,
    ) {}

    async findAll(): Promise<Wallet[]> {
        return this.walletRepository.find();
    }

    async findOne(userId: string): Promise<Wallet> {
        let wallet = await this.walletRepository.findOneBy({ userId });
        if (!wallet) {
            wallet = this.walletRepository.create({ userId, balance: 0 });
            await this.walletRepository.save(wallet);
        }
        return wallet;
    }

    async deposit(userId: string, amount: number): Promise<Wallet> {
        const wallet = await this.findOne(userId);
        wallet.balance = Number(wallet.balance) + Number(amount);
        return this.walletRepository.save(wallet);
    }

    async withdraw(userId: string, amount: number): Promise<Wallet> {
        const wallet = await this.findOne(userId);
        if (amount <= 0) throw new Error("Montant invalide");
        if (Number(wallet.balance) < Number(amount)) throw new Error("Fonds insuffisants");

        wallet.balance = Number(wallet.balance) - Number(amount);
        return this.walletRepository.save(wallet);
    }

    async debit(userId: string, amount: number): Promise<Wallet> {
        const wallet = await this.findOne(userId);
        if (Number(wallet.balance) < Number(amount)) throw new Error('Fonds insuffisants');
        wallet.balance = Number(wallet.balance) - Number(amount);
        return this.walletRepository.save(wallet);
    }

    async credit(userId: string, amount: number): Promise<Wallet> {
        const wallet = await this.findOne(userId);
        wallet.balance = Number(wallet.balance) + Number(amount);
        return this.walletRepository.save(wallet);
    }
}