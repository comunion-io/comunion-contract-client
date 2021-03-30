import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({
    comment: '',
  })
  id: string;

  @Column({
    comment: '',
  })
  avatar: string;

  @Column({
    comment: '',
  })
  publicKey: string;

  @Column({
    comment: '',
  })
  nonce: string;

  @Column({
    comment: '',
  })
  publicSecret: string;

  @Column({
    comment: '',
  })
  privateSecret: string;

  @Column({
    comment: '',
  })
  isHunter: boolean;

  @Column({
    comment: '',
  })
  createdAt: Date;

  @Column({
    comment: '',
  })
  updatedAt: Date;
}
