import {Column, Entity, PrimaryGeneratedColumn, Index, OneToMany} from 'typeorm';
import { Sighting } from './sighting.entity';

@Entity()
export class Gmina {
  @PrimaryGeneratedColumn({type: 'integer', name: 'gid'})
  gid: number;

  @Column('character varying', {
    name: 'jpt_kod_je',
    nullable: true,
    length: 20,
  })
  code: string | null;

  @Column('character varying', {
    name: 'jpt_nazwa_',
    nullable: true,
    length: 128,
  })
  name: string | null;

  @OneToMany(() => Sighting, sighting => sighting.gmina)
  sightings: Sighting[];

  @Column('numeric', {name: 'shape_leng', nullable: true, select: false})
  shapeLeng: string | null;

  @Column('numeric', {name: 'shape_area', nullable: true, select: false})
  shapeArea: string | null;

  @Index({spatial: true})
  @Column({type: 'geography', srid: 4326, select: false, nullable: true})
  geom: unknown;

}
