import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CommentReact } from "./comment-react.entity";
import { Post } from "./post.entity";
import { User } from "./user.entity";

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({nullable: false})
  content: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  // foreign key
  @ManyToOne(type => User, user => user.comments, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(type => Post, post => post.comments, {
    onDelete: 'CASCADE',
  })
  post: Post;

  @OneToMany(type => CommentReact, cr => cr.comment)
  commentReacts: CommentReact[];
}