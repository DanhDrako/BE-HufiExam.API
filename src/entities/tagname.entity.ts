import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./post.entity";

@Entity()
export class TagName {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @Column({ default: false })
  isBlackMarket: boolean;

  //===== foreign key
  @ManyToMany(() => Post, (post) => post.tags, {
    cascade: ['insert', 'update', 'soft-remove']
  })
  posts: Post[];
}