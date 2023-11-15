import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { List } from './../../lists/entities/list.entity';
import { Item } from './../../items/entities/item.entity';

@Entity("ListItems")
@Unique('listItem-item', ['list', 'item'])
@ObjectType()
export class ListItem {

  @Field(() => ID)
  @PrimaryGeneratedColumn("uuid")
  id: string

  @Field(() => Number)
  @Column({ type: "numeric" })
  quantity: number

  @Field(() => Boolean)
  @Column({ type: "boolean" })
  completed: boolean

  @ManyToOne(() => List, (list) => list.listItem, { lazy: true })
  @Field(() => Item)
  list: List

  @ManyToOne(() => Item, (item) => item.listItem, { lazy: true })
  @Field(() => Item)
  item: Item
}
