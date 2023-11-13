import { Injectable, NotFoundException } from '@nestjs/common';
import { Like, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from './entities/item.entity';
import { User } from './../users/entities/user.entity';
import { CreateItemInput, UpdateItemInput } from './dto/imputs';
import { PaginationArgs, SearchArgs } from './../common/dto/args';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>
  ) { }

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({ ...createItemInput, user })
    await this.itemsRepository.save(newItem)
    return newItem
  }

  async findAll(user: User, paginationArgs: PaginationArgs, searchArgs: SearchArgs): Promise<Item[]> {
    const { limit, offset } = paginationArgs
    const { search } = searchArgs

    const queryBuilder = this.itemsRepository.createQueryBuilder()
      .take(limit)
      .skip(offset)
      .where(`"userId" = :userId`, { userId: user.id })
    if (search) {
      queryBuilder.andWhere(`LOWER(name) like:name`, { name: `%${search.toLowerCase()}%` })
    }
    return queryBuilder.getMany()
    // const allItems = this.itemsRepository.find({
    //   take: limit,
    //   skip: offset,
    //   where: {
    //     user: {
    //       id: user.id
    //     },
    //     name: Like(`%${search}%`)
    //   }
    // })
    // return allItems;


  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({
      id, user: { id: user.id }
    })
    if (!item) throw new NotFoundException(`Producto con el id:${id} no encontrado`)
    return item
  }

  async update(id: string, updateItemInput: UpdateItemInput, user: User): Promise<Item> {
    await this.findOne(id, user)
    const item = await this.itemsRepository.preload(updateItemInput)
    if (!item) throw new NotFoundException(`Producto con el id:${id} no encontrado`)
    return this.itemsRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    const item = await this.findOne(id, user)
    await this.itemsRepository.remove(item)
    return { ...item, id };
  }

  async itemCountByUser(user: User): Promise<number> {
    return this.itemsRepository.count({
      where: {
        user: {
          id: user.id
        }
      }
    })
  }
}
