import { BeforeInsert, Column, CreateDateColumn, DeleteDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { IMAGE_UPLOAD_TYPE, RolerUser, SEX_USER } from "src/common/Enums";
import { Post } from "./post.entity";
import { UserReact } from "./user-react.entity";
import { Comment } from "./comment.entity";
import { CommentReact } from "./comment-react.entity";
import { Support } from "./support.entity";
import { User2UserMessage } from "./user2user-message.entity";
import { Rank } from "./rank.entity";

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  displayName: string;

  @Column({
    type: "varchar",
    length: 100,
  })
  username: string;

  @Column({
    type: "varchar",
    nullable: false,
    length: 100,
  })
  password: string;

  @Column({
    type: "varchar",
    nullable: false,
    length: 100,
  })
  email: string;

  @Column({ nullable: true })
  birthDay: Date;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: SEX_USER.OTHER })
  sex: SEX_USER;

  @Column({ nullable: true })
  linkFacebook: string;

  @Column('enum', { enum: RolerUser, default: RolerUser.MEM },)
  role: RolerUser;

  @Column({ nullable: true })
  avatar: string;

  @Column({ default: IMAGE_UPLOAD_TYPE.SERVER })
  avatarUploadType: IMAGE_UPLOAD_TYPE;

  @Column({ nullable: true })
  accessToken: string;

  @CreateDateColumn()
  createAt?: Date;

  @UpdateDateColumn()
  updateAt?: Date

  @Column({ type: "varchar", nullable: true, length: 100 })
  niceName: string;

  @Column({ default: false })
  isActive: boolean;

  @DeleteDateColumn()
  deleteAt: Date;

  @Column({ default: false })
  isOnline: boolean;

  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Foreign key
  @OneToMany(type => Post, post => post.own)
  posts: Post[];

  @OneToMany(type => UserReact, ur => ur.user)
  reacts: UserReact;

  @OneToMany(type => Comment, comment => comment.user)
  comments: Comment[];

  @OneToMany(type => CommentReact, cr => cr.user)
  commentReacts: CommentReact[];

  @OneToMany(type => Support, support => support.user)
  supports: Support[];

  @OneToMany(type => User2UserMessage, u2u => u2u.user1)
  userMess: User2UserMessage[];

  @OneToMany(type => Rank, rank => rank.user)
  ranks: Rank[];
}