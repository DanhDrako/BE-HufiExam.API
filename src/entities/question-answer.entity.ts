import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./post.entity";

@Entity()
export class QuestionAnswer {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ nullable: false })
  q: string;

  @Column({ nullable: false })
  a: string;

  @Column({ nullable: true })
  qa: number;

  @Column({ nullable: true })
  orderIndex: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  //===== foreign key
  @ManyToOne(type => Post, post => post.qAs, {
    onDelete: 'CASCADE',
  })
  post: Post;
}