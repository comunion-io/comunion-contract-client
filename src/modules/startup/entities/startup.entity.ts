import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('startups')
export class Startup {
  @PrimaryGeneratedColumn({
    comment: '',
  })
  id: string;

  @Column({
    comment: '',
  })
  name: string;

  @Column({
    comment: '',
  })
  uid: string;

  @Column({
    comment: '',
  })
  currentRevisionId: string;

  @Column({
    comment: '',
  })
  confirmingRevisionId: string;

  @Column({
    comment: '',
  })
  createdAt: Date;

  @Column({
    comment: '',
  })
  updatedAt: Date;
}
