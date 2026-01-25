import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common'; // 👈 Ajout UseGuards
import { EventPattern, Payload } from '@nestjs/microservices';
import { WalletService } from './wallet.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('wallet')
export class WalletController {
    constructor(private readonly walletService: WalletService) {}


    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll() {
        return this.walletService.findAll();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.walletService.findOne(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/deposit')
    deposit(@Param('id') id: string, @Body() data: { amount: number }) {
        return this.walletService.deposit(id, data.amount);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post(':id/withdraw')
    withdraw(@Param('id') id: string, @Body() data: { amount: number }) {
        return this.walletService.withdraw(id, data.amount);
    }

    // --- MICROSERVICES (RabbitMQ) ---

    @EventPattern('wallet_debit')
    async handleDebit(@Payload() data: { userId: string; amount: number }) {
        console.log(`RabbitMQ (Wallet) : 📉 Débit de ${data.amount}€ pour ${data.userId}`);
        await this.walletService.debit(data.userId, data.amount);
    }

    @EventPattern('payout_user')
    async handlePayout(@Payload() data: { punterId: string; amount: number }) {
        console.log(`RabbitMQ (Wallet) : 📈 VICTOIRE ! Crédit de ${data.amount}€ pour ${data.punterId}`);
        await this.walletService.credit(data.punterId, data.amount);
    }
}