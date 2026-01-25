import { IsString, IsNumber, Min, Max, IsEnum, IsUUID } from 'class-validator';

export enum BetSelection {
    HOME = 'HOME',
    DRAW = 'DRAW',
    AWAY = 'AWAY',
}

export class CreateBetDto {
    @IsUUID()
    matchId: string;

    @IsUUID()
    punterId: string;

    @IsEnum(BetSelection)
    selection: BetSelection;

    @IsNumber()
    @Min(0.10, { message: "La mise minimale est de 0.10€" })
    @Max(1000, { message: "La mise maximale est de 1000€" })
    stake: number;
}