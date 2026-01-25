import { Injectable, BadRequestException, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { CreateBetDto } from './dto/create-bet.dto';
import { Bet } from './entities/bet.entity';
import { Match } from './entities/match.entity';

@Injectable()
export class BettingService implements OnModuleInit {
    constructor(
        @InjectRepository(Match, 'betting_con')
        private matchRepository: Repository<Match>,

        @InjectRepository(Bet, 'betting_con')
        private betRepository: Repository<Bet>,

        @Inject('WALLET_SERVICE') private readonly walletClient: ClientProxy,
    ) {}

    async onModuleInit() {
        const count = await this.matchRepository.count();
        if (count === 0) {
            await this.matchRepository.save([
                { homeTeam: 'PSG', awayTeam: 'OM', oddsHome: 1.5, oddsDraw: 3.2, oddsAway: 4.5, startTime: new Date(Date.now() + 3600000), status: 'UPCOMING' },
                { homeTeam: 'Real Madrid', awayTeam: 'Barca', oddsHome: 2.1, oddsDraw: 3.0, oddsAway: 2.8, startTime: new Date(Date.now() + 7200000), status: 'UPCOMING' }
            ]);
            console.log('Matchs de test insérés !');
        }
    }

    async findAll() { return this.betRepository.find(); }
    async findMatches() { return this.matchRepository.find(); }

    async findByPunter(punterId: string) {
        return this.betRepository.find({
            where: { punterId },
            order: { createdAt: 'DESC' }
        });
    }

    async create(createBetDto: CreateBetDto) {
        const { matchId, punterId, selection, stake } = createBetDto;

        const match = await this.matchRepository.findOneBy({ id: matchId });
        if (!match) throw new BadRequestException('Match introuvable');
        if (match.status !== 'UPCOMING') throw new BadRequestException('Match fini');

        let odds = 1;
        if (selection === 'HOME') odds = Number(match.oddsHome);
        else if (selection === 'DRAW') odds = Number(match.oddsDraw);
        else if (selection === 'AWAY') odds = Number(match.oddsAway);

        const bet = this.betRepository.create({
            matchId, punterId, selection, stake,
            potentialGain: stake * odds,
            status: 'PENDING',
        });
        await this.betRepository.save(bet);

        console.log(`Envoi RabbitMQ : Débit de ${stake}€ pour ${punterId}`);
        this.walletClient.emit('wallet_debit', { userId: punterId, amount: stake });

        return bet;
    }

    async finishMatch(matchId: string, scoreHome: number, scoreAway: number) {
        const match = await this.matchRepository.findOneBy({ id: matchId });
        if (!match) throw new BadRequestException('Match introuvable');

        match.scoreHome = scoreHome;
        match.scoreAway = scoreAway;
        match.status = 'FINISHED';
        await this.matchRepository.save(match);

        let winningSelection = 'DRAW';
        if (scoreHome > scoreAway) winningSelection = 'HOME';
        if (scoreAway > scoreHome) winningSelection = 'AWAY';

        const bets = await this.betRepository.find({ where: { matchId: matchId, status: 'PENDING' } });

        for (const bet of bets) {
            if (bet.selection === winningSelection) {
                bet.status = 'WON';
                this.walletClient.emit('payout_user', { punterId: bet.punterId, amount: bet.potentialGain });
            } else {
                bet.status = 'LOST';
            }
            await this.betRepository.save(bet);
        }
        return { message: 'Match terminé', match };
    }
}