import { IMAGE_UPLOAD_TYPE } from "src/common/Enums";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./post.entity";

@Entity()
export class Category {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  imageBanner: string;

  @Column({ default: IMAGE_UPLOAD_TYPE.SERVER })
  imageUploadType: IMAGE_UPLOAD_TYPE;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @Column({ default: false })
  isBlackMarket: boolean;

  //===== foreign key
  @OneToMany(type => Post, post => post.cate)
  posts: Post[];
}