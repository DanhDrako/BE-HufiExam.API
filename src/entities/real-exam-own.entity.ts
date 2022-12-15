import { IsNotEmpty } from "class-validator";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Post } from "./post.entity";
import { User } from "./user.entity";

@Entity()
export class RealExamOwn {
    @PrimaryGeneratedColumn('increment')
    id: number;

    @Column()
    @IsNotEmpty()
    email: string;

    @Column({default: false})
    ttexam: boolean;
    
    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
  
    @DeleteDateColumn()
    deleteAt: Date;

    // ==== Foreign key
    @ManyToOne(type => Post, post =>  post.reals)
    post: Post;

    @OneToOne(type => User, user => user.id)
    ownId: User;
}
