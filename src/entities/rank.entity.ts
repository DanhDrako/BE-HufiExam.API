import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn } from "typeorm";
import { Post } from "./post.entity";
import { User } from "./user.entity";

@Entity()
@Unique('unique_rank', ['user', 'post'])
export class Rank {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @ManyToOne(type => Post, post => post.ranks, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @ManyToOne(type => User, user => user.ranks, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({default: 0})
  tryNumber: number;

  @Column({type: 'real'})
  point: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}