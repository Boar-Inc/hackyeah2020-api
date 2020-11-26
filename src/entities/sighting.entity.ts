import {Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn, BaseEntity} from 'typeorm';

@Entity()
export class Sighting extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'point',
    transformer: {
      from: v => {return {lat: v.x, long: v.y}},
      to: v => `${v.lat},${v.lng}`,
    },
  })
  coordinates: {lat: number, lng: number};

  @CreateDateColumn()
  createdOn: Date;

  @UpdateDateColumn()
  updatedOn: Date;
}
