import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('startup_settings')
export class StartupSettings {
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
