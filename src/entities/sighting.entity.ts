import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from 'typeorm';

@Entity()
export class Sighting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'point',
    transformer: {
      from: (v: {x: number, y: number}) => ({lat: v.x, long: v.y}),
      to: (v: {lat: number, lng: number}) => `${v.lat},${v.lng}`,
    },
  })
  coordinates: {lat: number, lng: number};

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn()
  updatedOn: Date;
}
