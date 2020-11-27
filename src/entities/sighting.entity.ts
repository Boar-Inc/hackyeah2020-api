import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export class Sighting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({type: 'geography', srid: 4326})
  location: {type: string, coordinates: number[]};

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn()
  updatedOn: Date;
}
