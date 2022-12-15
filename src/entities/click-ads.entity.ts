import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity()
export class ClickAds {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column({nullable: false})
  clickAt: number;

  @Column({nullable: true})
  clickAtViewUTC: string;
}