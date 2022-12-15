import { COUNT_TYPE } from "src/common/Enums";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Counts {
  @PrimaryGeneratedColumn('rowid')
  id: number;

  @Column({ nullable: false })
  type: COUNT_TYPE;

  @Column({ default: 0 })
  count: number;

  @Column({ nullable: false })
  date: Date;

  @Column({default: 0})
  total: number;
}