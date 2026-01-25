import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Bet {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    punterId: string;

    @Column()
    matchId: string;

    @Column()
    selection: 'HOME' | 'DRAW' | 'AWAY';

    @Column('decimal', { precision: 10, scale: 2 })
    stake: number;

    @Column('decimal', { precision: 10, scale: 2 })
    potentialGain: number;

    @Column({ default: 'PENDING' })
    status: 'PENDING' | 'WON' | 'LOST';

    @CreateDateColumn()
    createdAt: Date;
}