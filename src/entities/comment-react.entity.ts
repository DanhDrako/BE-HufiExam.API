import { COMMENT_REACT_TYPE } from "src/common/Enums";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Comment } from "./comment.entity";
import { User } from "./user.entity";

@Entity()
export class CommentReact {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ default: COMMENT_REACT_TYPE.NOTHING })
  status: COMMENT_REACT_TYPE;

  @ManyToOne(type => User, user => user.commentReacts, {
    onDelete: 'CASCADE',  
  })
  user: User;

  @ManyToOne(type => Comment, comment => comment.commentReacts, {
    onDelete: 'CASCADE',
  })
  comment: Comment;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}