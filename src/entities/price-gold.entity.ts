import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Double,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class PriceGold {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ nullable: false })
  province: string;

  @Column({ nullable: false })
  typeGold: string;

  @Column({ nullable: false })
  buy: string;

  @Column({ nullable: false })
  sell: string;

  @Column({ nullable: false })
  dateUpdated: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;

}
