import { IMAGE_UPLOAD_TYPE } from "src/common/Enums";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Category } from "./category.entity";
import { Comment } from "./comment.entity";
import { QuestionAnswer } from "./question-answer.entity";
import { Rank } from "./rank.entity";
import { RealExamOwn } from "./real-exam-own.entity";
import { TagName } from "./tagname.entity";
import { UserReact } from "./user-react.entity";
import { User } from "./user.entity";

@Entity()
export class Post {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  title: string;

  @Column({ nullable: false })
  description: string;

  @Column()
  imageBanner: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  slug: string;

  @Column({ default: IMAGE_UPLOAD_TYPE.SERVER })
  imageUploadType: IMAGE_UPLOAD_TYPE;

  @Column({ nullable: true })
  images: string;

  @Column({ nullable: false })
  linksDownload: string;

  @Column({ default: false })
  isBlackMarket: boolean;

  @Column({ default: 0 })
  priceBuy: number;

  @Column({ default: 0 })
  priceSell: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @Column({ default: true })
  isRandom: boolean;

  @Column({ default: false })
  commited: boolean;

  @Column({ default: true })
  isShowRank: boolean;

  @Column({ default: false })
  isRealTest: boolean;

  @Column({ nullable: true })
  realTestTime: number;

  @Column({ default: false })
  realTestRandom: boolean;

  //===== Foreign key
  @ManyToOne(type => Category, cate => cate.posts, {
    onDelete: 'CASCADE',
  })
  cate: Category;

  @ManyToOne(type => User, user => user.posts, {
    onDelete: 'CASCADE',
  })
  own: User;

  @ManyToMany(type => TagName, tag => tag.posts, {
    cascade: ['insert', 'update', 'remove', 'soft-remove']
  })
  @JoinTable({ name: 'posts_tags' })
  tags: TagName[];

  @OneToMany(type => UserReact, ur => ur.post)
  reacts: UserReact;

  @OneToMany(type => Comment, comment => comment.post)
  comments: Comment[];

  @OneToMany(type => QuestionAnswer, qAs => qAs.post)
  qAs: QuestionAnswer[];

  @OneToMany(type => Rank, rank => rank.post)
  ranks: Rank[];

  @OneToMany(type => RealExamOwn, reals => reals.post)
  reals: RealExamOwn[];
}