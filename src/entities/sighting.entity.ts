import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, Index, OneToMany, ManyToOne} from 'typeorm';
import { Gmina } from './gmina.entity';

export const BoarCondition = ['alive', 'dead', 'remains'] as const;

@Entity()
export class Sighting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'integer',
    default: 1,
  })
  amount: number;

  @Column({
    type: 'integer',
    default: 10,
  })
  age: number;

  @Column({
    type: 'enum',
    enum: BoarCondition,
    default: BoarCondition[0],
  })
  condition: typeof BoarCondition[number];

  @ManyToOne(() => Gmina, gmina => gmina.sightings)
  gmina: Gmina;

  @Index({spatial: true})
  @Column({type: 'geography', srid: 4326})
  location: {type: string, coordinates: number[]};

  @Column({nullable: true})
  imageURL: string;

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn({select: false})
  updatedOn: Date;
}
