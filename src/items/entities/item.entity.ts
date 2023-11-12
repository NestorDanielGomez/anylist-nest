import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { User } from '../../users/entities/user.entity';
import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: "items" })
@ObjectType()
export class Item {

  @PrimaryGeneratedColumn("uuid")
  @Field(() => ID)
  id: string

  @Column()
  @Field(() => String)
  name: string

  // @Column()
  // @Field(() => Number)
  // quantity: number

  @Column({ nullable: true })
  @Field(() => String, { nullable: true })
  quantityUnits?: string

  @ManyToOne(() => User, (user) => user.items, { nullable: false, lazy: true })
  @Index("userId")
  @Field(() => User)
  user: User

}
