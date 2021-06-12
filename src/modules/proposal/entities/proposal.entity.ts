import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('proposals')
export class Proposal {
  @PrimaryGeneratedColumn({
    comment: '',
  })
  id: string;

  @Column({
    comment: '',
  })
  startupId: string;

  @Column({
    comment: '',
  })
  status: number;

  @Column({
    comment: '',
  })
  duration: number;

  @Column({
    comment: '',
  })
  createdAt: Date;
}
