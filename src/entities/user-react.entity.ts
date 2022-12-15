import { REACT_TYPE } from "src/common/Enums";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./post.entity";
import { User } from "./user.entity";

@Entity()
export class UserReact {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(type => User, user => user.reacts, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(type => Post, post => post.reacts, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @Column({ nullable: false })
  reactType: REACT_TYPE;

  @Column({ default: true })
  isReact: boolean;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}