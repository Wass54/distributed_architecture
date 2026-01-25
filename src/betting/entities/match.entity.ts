import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  homeTeam: string;

  @Column()
  awayTeam: string;

  @Column('decimal', { precision: 5, scale: 2 })
  oddsHome: number;

  @Column('decimal', { precision: 5, scale: 2 })
  oddsDraw: number;

  @Column('decimal', { precision: 5, scale: 2 })
  oddsAway: number;

  @Column()
  startTime: Date;

  @Column({ default: 'UPCOMING' })
  status: 'UPCOMING' | 'LIVE' | 'FINISHED';

  // 👇 NOUVEAU : On stocke le score final
  @Column({ nullable: true })
  scoreHome: number;

  @Column({ nullable: true })
  scoreAway: number;
}