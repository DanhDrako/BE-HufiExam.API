import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class Support {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ nullable: false })
  title: string;

  @Column({ nullable: false })
  message: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

  @Column({ nullable: true, default: 0 })
  idSupportFather: number;

  //===== foreign key
  @ManyToOne(type => User, user => user.supports, {
    onDelete: 'CASCADE',
  })
  user: User;
}