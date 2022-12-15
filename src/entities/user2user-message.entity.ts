import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class User2UserMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  room: string;

  @Column({ nullable: false })
  message: string;

  @Column({ default: false })
  isRead: boolean;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  // foreign
  @ManyToOne(type => User, user => user.userMess, {
    onDelete: 'CASCADE',
  })
  user1: User;

  @ManyToOne(type => User, user => user.userMess, {
    onDelete: 'CASCADE',
  })
  user2: User;
}