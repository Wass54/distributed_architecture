import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { BettingService } from './betting.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('betting')
export class BettingController {
    constructor(private readonly bettingService: BettingService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post()
    create(@Body() createBetDto: CreateBetDto) {
        return this.bettingService.create(createBetDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll() {
        return this.bettingService.findAll();
    }


    @Get('matches')
    findMatches() {
        return this.bettingService.findMatches();
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('punter/:punterId')
    findMyBets(@Param('punterId') punterId: string) {
        return this.bettingService.findByPunter(punterId);
    }

    @Post('matches/:id/finish')
    finishMatch(@Param('id') id: string, @Body() body: { scoreHome: number; scoreAway: number }) {
        return this.bettingService.finishMatch(id, body.scoreHome, body.scoreAway);
    }
}